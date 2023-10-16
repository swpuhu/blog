(module
    (memory $mem 1)
    (data (i32.const 0) "Hello WebAssembly!")
    (export "mem" (memory $mem))
)