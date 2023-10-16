(module
    (func $add32 (param $a i32) (param $b i32) (result i32)
        local.get $a
        local.get $b
        i32.add
        return    
    )
    (func $sub32 (param $a i32) (param $b i32) (result i32)
        local.get $a
        local.get $b
        i32.sub
        return    
    )

    (func $mul32 (param $a i32) (param $b i32) (result i32)
        local.get $a
        local.get $b
        i32.mul
        return    
    )

    (export "add" (func $add32))
    (export "sub" (func $sub32))
    (export "mul" (func $mul32))
)