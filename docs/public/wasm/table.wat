(module
    (import "js" "table" (table $tbl 1 funcref))
    (import "env" "log" (func $log (param i32)))
    (type $f_void_void (func (param i32) (param i32) (result i32))) 
    (func $main (param $1 i32) (param $2 i32)
        local.get $1
        local.get $2
        
        (call_indirect $tbl (type $f_void_void) (i32.const 0))

        call $log
    )
    (export "test" (func $main))
)