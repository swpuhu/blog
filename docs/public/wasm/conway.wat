(module
    (import "env" "log" (func $log (param i32)))
    (memory $mem 10)
    (func $checkStatus 
    (param $src i32) 
    (param $x i32) 
    (param $y i32) 
    (param $width i32)
    (param $height i32)
    (result i32)

        local.get $x
        i32.const 0
        i32.lt_s

        local.get $x
        local.get $width
        i32.ge_s
        i32.or

        local.get $y
        i32.const 0
        i32.lt_s
        i32.or

        local.get $y
        local.get $height
        i32.ge_s
        i32.or

        (if
            (then
                i32.const 0
                return
            )
            (else 
                local.get $x
                local.get $y
                local.get $width
                i32.mul
                i32.add

                local.get $src
                i32.add

                i32.load8_u
                return
            )
        )
        i32.const 0
        return
    )
    (func $storeDst 
        (param $count i32)
        (param $src i32) 
        (param $dst i32) 
        (param $o i32)
        (local $srcOffset i32)
        (local $dstOffset i32)
        (local $temp i32)
        
        local.get $src
        local.get $o
        i32.add
        local.set $srcOffset

        local.get $dst
        local.get $o
        i32.add
        local.set $dstOffset

        local.get $dstOffset

        local.get $srcOffset
        i32.load8_u
        local.tee $temp
        
        i32.store8
        
        ;; source[i]
        local.get $temp
        i32.const 1
        i32.eq
        (if
            (then
                local.get $count
                i32.const 2
                i32.lt_s
                (if
                    (then
                        local.get $dstOffset
                        i32.const 0
                        i32.store8
                    )
                    (else 
                        local.get $count
                        i32.const 2
                        i32.eq

                        local.get $count
                        i32.const 3
                        i32.eq
                        i32.or
                        (if 
                            (then
                                nop
                            )
                            (else 
                                local.get $count
                                i32.const 3
                                i32.gt_s
                                (if 
                                    (then
                                        local.get $dstOffset
                                        i32.const 0
                                        i32.store8
                                    )
                                )
                            )
                        )
                    )
                )
            )
            (else
                local.get $count
                i32.const 3
                i32.ge_s
                (if
                    (then
                        local.get $dstOffset
                        i32.const 1
                        i32.store8
                    )
                )
            )
        )   


        
        
    
    )
    (func $simulate (param $src i32) (param $dst i32) (param $width i32) (param $height i32)
        (local $num i32)
        (local $x i32)
        (local $y i32)
        (local $i i32)
        i32.const 0
        local.set $i

        local.get $width
        local.get $height
        i32.mul
        local.set $num

        (loop $iter
            local.get $i
            local.get $width
            i32.div_u
            local.set $y

            local.get $i
            local.get $y
            local.get $width
            i32.mul
            i32.sub
            local.set $x

            ;; x - 1, y
            i32.const 0
            local.get $src
            local.get $x
            i32.const 1
            i32.sub
            local.get $y
            local.get $width
            local.get $height

            call $checkStatus
            i32.add


            ;; x - 1, y - 1
            local.get $src
            local.get $x
            i32.const 1
            i32.sub
            local.get $y
            i32.const 1
            i32.sub
            local.get $width
            local.get $height

            call $checkStatus
            i32.add

            ;; x, y - 1
            local.get $src
            local.get $x
            local.get $y
            i32.const 1
            i32.sub
            local.get $width
            local.get $height

            call $checkStatus
            i32.add


            ;; x + 1, y - 1
            local.get $src
            local.get $x
            i32.const 1
            i32.add
            local.get $y
            i32.const 1
            i32.sub
            local.get $width
            local.get $height

            call $checkStatus
            i32.add
 
            ;; x + 1, y
            local.get $src
            local.get $x
            i32.const 1
            i32.add
            local.get $y
            local.get $width
            local.get $height

            call $checkStatus
            i32.add

            ;; x + 1, y + 1
            local.get $src
            local.get $x
            i32.const 1
            i32.add
            local.get $y
            i32.const 1
            i32.add
            local.get $width
            local.get $height

            call $checkStatus
            i32.add

            ;; x, y + 1
            local.get $src
            local.get $x
            local.get $y
            i32.const 1
            i32.add
            local.get $width
            local.get $height

            call $checkStatus
            i32.add

            ;; x - 1, y + 1
            local.get $src
            local.get $x
            i32.const 1
            i32.sub
            local.get $y
            i32.const 1
            i32.add
            local.get $width
            local.get $height

            call $checkStatus
            i32.add

            ;;call $log
            local.get $src
            local.get $dst
            local.get $i
            call $storeDst

            local.get $i
            i32.const 1
            i32.add
            local.set $i

            local.get $i
            local.get $num
            i32.lt_s
            br_if $iter
        )
    
    )
    (export "mem" (memory $mem))
    (export "simulate" (func $simulate))

)