(module
    (func $add2 (param $a i32) (param $b i32) (result i32)

        (local $c i32)
        
        local.get $a
        local.get $b
        i32.add

        local.tee $c

        return
    )
    (export "add2" (func $add2))
)