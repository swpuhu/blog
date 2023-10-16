(module
    (memory $mem 1)
    (export "mem" (memory $mem))
    (func $add1 (param $p1 i32)
        local.get $p1
        i32.const 1
        i32.add
        return
    )
    (func $addArray 
        (param $arr1 i32) 
        (param $arr2 i32) 
        (param $len i32)
        (local $p1 i32)
        (local $p2 i32)
        (local $i i32)

        i32.const 0
        local.set $i

        local.get $arr1
        local.set $p1

        local.get $arr2
        local.set $p2

        (loop $iter
            local.get $p2
            
            local.get $p1
            i32.load8_u

            local.get $p2
            i32.load8_u
            i32.add

            i32.store8

            local.get $p1
            i32.const 1
            i32.add
            local.set $p1

            local.get $p2
            i32.const 1
            i32.add
            local.set $p2

            local.get $i
            i32.const 1
            i32.add
            local.set $i

            local.get $i
            local.get $len
            i32.lt_s
            br_if $iter         
        )
    )
    (export "addArray" (func $addArray))
)