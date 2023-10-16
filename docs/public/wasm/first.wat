(module
    (func $add2 (param $a f64) (param $b f64) (result f64)
        (local $c f64)
    
        local.get $a
        local.get $b
        f64.add
        local.tee $c
        return
    )
    (export "addf" (func $add2))
)


