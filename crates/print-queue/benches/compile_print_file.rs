use criterion::BenchmarkId;
use criterion::{criterion_group, criterion_main, Criterion};
use teg_print_queue::compile_print_file;

// This is a struct that tells Criterion.rs to use the "futures" crate's current-thread executor
use criterion::async_executor::AsyncStdExecutor;

/// ### Baseline: Copying 17MB in bash
/// Linux's `cp` command provides a good baseline for the maximum IO throughput we should expect.
///
/// As a first aproximation we should be able to be within an order of magnitude of the performance
/// of the `cp` command.
///
/// #### `cp` on a Raspberry Pi 4
/// real	0m0.104s
/// user	0m0.002s
/// sys		m0.098s
///
/// #### `cp` on an XPS15 (2020 Model / 8 Core Intel)
/// real	0m0.017s
/// user	0m0.000s
/// sys 	0m0.017s
pub fn criterion_benchmark(c: &mut Criterion) {
    let part_file_path = std::env::var("BENCHMARK_GCODE_FILE")
        .expect("Please set the BENCHMARK_GCODE_FILE environment variable");

    let mut group = c.benchmark_group("compile_print_files");

    // This baseline has performance not too far from Linux's `cp`.
    // As a first aproximation on an x64 Intel I see then fn taking 1.6x the wall time of `cp`.
    group.bench_function("Baseline: Synchronous Copy / All at Once", |b| {
        b.iter(|| {
            use std::fs::File;
            use std::io::{
                Read,
                // BufWriter,
                Write,
            };

            let task_file_path = tempfile::NamedTempFile::new()
                .unwrap()
                .into_temp_path();

            let mut f = File::open(&part_file_path)
                .expect("Unable to open file");
            let mut gcodes = Vec::with_capacity(16 * 1024 * 1024);

            f.read_to_end(&mut gcodes).unwrap();

            let mut f = File::create(task_file_path)
                .expect("Unable to create file");
            // let mut f = BufWriter::new(f);

            f.write_all(&gcodes[..])
                .expect("Unable to write data");
            f.flush().unwrap();
        })
    });

    group.bench_function("Baseline: Synchronous Copy / By Line", |b| {
        b.iter(|| {
            use std::fs::File;
            use std::io::{
                BufReader,
                BufRead,
                BufWriter,
                Write,
            };

            let task_file_path = tempfile::NamedTempFile::new()
                .unwrap()
                .into_temp_path();

            let f = File::open(&part_file_path)
                .expect("Unable to open file");
            let gcodes = BufReader::new(f).lines();

            let f = File::create(task_file_path)
                .expect("Unable to create file");
            let mut f = BufWriter::new(f);

            for gcode in gcodes {
                f.write_all(gcode.unwrap().as_bytes())
                    .expect("Unable to write data");
            }
            f.flush().unwrap();
        })
    });

    group.bench_function("Baseline: Async Copy / By Line", |b| {
        b.to_async(AsyncStdExecutor).iter(|| async {
            use async_std::fs::File;
            use async_std::io::{
                BufReader,
                BufWriter,
            };
            use futures::prelude::*;

            let task_file_path = tempfile::NamedTempFile::new()
                .unwrap()
                .into_temp_path();

            let f = File::open(&part_file_path)
                .await
                .expect("Unable to open file");
            let mut gcodes = BufReader::new(f).lines();

            let f = File::create(task_file_path.to_str().unwrap())
                .await
                .expect("Unable to create file");
            let mut f = BufWriter::new(f);

            while let Some(gcode) = gcodes.next().await {
                f.write_all(gcode.unwrap().as_bytes())
                    .await
                    .expect("Unable to write data");
            }
            f.flush().await.unwrap();
        })
    });

    let buffer_sizes: Vec<usize> = vec![
        1 * 1024 * 1024, // 1 MB
        // 128 * 1024, // 128 KB
        // 8 * 1024, // 8 KB - Rust default buffer size
        // 4 * 1024, // SSD 4K Advanced Format Sector Size
        // 512, // 512 byte SD Card Sector Size
    ];

    let read_sizes = buffer_sizes
        .iter()
        .map(|read_size| (*read_size, buffer_sizes[0]));

    let write_sizes = buffer_sizes
        .iter()
        .skip(1)
        .map(|write_size| (buffer_sizes[0], *write_size));

    for (read_buffer_size, write_buffer_size) in read_sizes.chain(write_sizes) {
        let input = (read_buffer_size, write_buffer_size);
        let id = BenchmarkId::new(
            "compile_print_files",
            format!(
                "Read Buffer: {}, Write Buffer: {}",
                read_buffer_size,
                write_buffer_size,
            ),
        );

        group.bench_with_input(id, &input, |b, &_s| {
            b.to_async(AsyncStdExecutor).iter(|| async {
                let task_file_path = tempfile::NamedTempFile::new()
                    .unwrap()
                    .into_temp_path();

                let compile_internal_macro = |_| async {
                    Ok(vec![])
                };

                let annotated_gcode_stream = compile_print_file(
                    &part_file_path,
                    task_file_path.to_str().unwrap(),
                    "",
                    "",
                    compile_internal_macro,
                    read_buffer_size,
                    write_buffer_size,
                );

                annotated_gcode_stream.await.unwrap()
            })
        });
    }
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);
