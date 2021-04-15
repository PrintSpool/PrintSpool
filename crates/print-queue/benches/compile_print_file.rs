use criterion::BenchmarkId;
use criterion::{black_box, criterion_group, criterion_main, Criterion};
use teg_print_queue::compile_print_file;

// This is a struct that tells Criterion.rs to use the "futures" crate's current-thread executor
use criterion::async_executor::AsyncStdExecutor;

pub fn criterion_benchmark(c: &mut Criterion) {
    let buffer_sizes: Vec<usize> = vec![
        1 * 1024 * 1024, // 1 MB
        128 * 1024, // 128 KB
        8 * 1024, // 8 KB - Rust default buffer size
        4 * 1024, // SSD 4K Advanced Format Sector Size
        512, // 512 byte SD Card Sector Size
    ];

    let buffer_sizes = buffer_sizes
        .iter()
        .flat_map(|read_size| {
            buffer_sizes.iter()
                .map(|write_size| (*read_size, *write_size))
                .collect::<Vec<_>>()
        });

    for (read_buffer_size, write_buffer_size) in buffer_sizes {
        let input = (read_buffer_size, write_buffer_size);
        let id = BenchmarkId::new(
            "compile_print_files",
            format!(
                "read buffer: {}, write buffer: {}",
                read_buffer_size,
                write_buffer_size,
            ),
        );

        c.bench_with_input(id, &input, |b, &s| {
            b.to_async(AsyncStdExecutor).iter(|| async {
                let part_file_path = std::env::var("BENCHMARK_GCODE_FILE")
                    .expect("Please set the BENCHMARK_GCODE_FILE environment variable");

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
