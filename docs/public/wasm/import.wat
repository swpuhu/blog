(module
    
    (import "env" "log" (func $logNum (param i32)))

    (func $main
        i32.const 666
        call 0
    )
    (start $main)
)

