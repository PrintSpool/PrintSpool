use teg_marlin::gcode_codec::response::parse_response;

use criterion::{black_box, criterion_group, criterion_main, Criterion};

// fn fibonacci(n: u64) -> u64 {
//     match n {
//         0 => 1,
//         1 => 1,
//         n => fibonacci(n-1) + fibonacci(n-2),
//     }
// }

fn ok(c: &mut Criterion) {
    c.bench_function("ok", |b| b.iter(|| {
        let src = "ok\n";
        parse_response(black_box(src)).unwrap()
    }));
}

fn ok_with_feedback(c: &mut Criterion) {
    c.bench_function("ok_with_feedback", |b| b.iter(|| {
        let src = "ok T:25.0 /0.0 B:25.0 /0.0 T0:25.0 /0.0 @:0 B@:0\n";
        parse_response(black_box(src)).unwrap()
    }));
}

fn temperature_feedback(c: &mut Criterion) {
    c.bench_function("temperature_feedback", |b| b.iter(|| {
        let src = "T:25.0 /0.0 B:25.0 /0.0 T0:25.0 /0.0 @:0 B@:0\n";
        parse_response(black_box(src)).unwrap()
    }));
}

fn position_feedback(c: &mut Criterion) {
    c.bench_function("position_feedback", |b| b.iter(|| {
        let src = "X:0.00 Y:191.00 Z:159.00 E:0.00 Count X: 0 Y:19196 Z:254400\n";
        parse_response(black_box(src)).unwrap()
    }));
}

criterion_group!(benches,
    ok,
    ok_with_feedback,
    temperature_feedback,
    position_feedback,
);
criterion_main!(benches);
