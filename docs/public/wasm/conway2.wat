(module
 (table 0 anyfunc)
 (memory $0 1)
 (export "memory" (memory $0))
 (export "main" (func $main))
 (export "checkStatus" (func $checkStatus))
 (export "simulate" (func $simulate))
 (func $main (; 0 ;) (result i32)
  (i32.const 42)
 )
 (func $checkStatus (; 1 ;) (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (result i32)
  (local $5 i32)
  (set_local $5
   (i32.const 0)
  )
  (block $label$0
   (br_if $label$0
    (i32.lt_s
     (get_local $1)
     (i32.const 0)
    )
   )
   (set_local $5
    (i32.const 0)
   )
   (br_if $label$0
    (i32.lt_s
     (get_local $2)
     (i32.const 0)
    )
   )
   (br_if $label$0
    (i32.ge_s
     (get_local $1)
     (get_local $3)
    )
   )
   (br_if $label$0
    (i32.ge_s
     (get_local $2)
     (get_local $4)
    )
   )
   (set_local $5
    (i32.load
     (i32.add
      (get_local $0)
      (i32.shl
       (i32.add
        (i32.mul
         (get_local $3)
         (get_local $2)
        )
        (get_local $1)
       )
       (i32.const 2)
      )
     )
    )
   )
  )
  (get_local $5)
 )
 (func $simulate (; 2 ;) (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 i32)
  (local $13 i32)
  (local $14 i32)
  (local $15 i32)
  (local $16 i32)
  (local $17 i32)
  (local $18 i32)
  (local $19 i32)
  (block $label$0
   (br_if $label$0
    (i32.lt_s
     (tee_local $4
      (i32.mul
       (get_local $3)
       (get_local $2)
      )
     )
     (i32.const 1)
    )
   )
   (set_local $5
    (i32.sub
     (i32.const 0)
     (get_local $2)
    )
   )
   (set_local $7
    (i32.add
     (get_local $0)
     (tee_local $6
      (i32.shl
       (get_local $2)
       (i32.const 2)
      )
     )
    )
   )
   (set_local $8
    (i32.add
     (get_local $0)
     (i32.sub
      (i32.const -4)
      (get_local $6)
     )
    )
   )
   (set_local $13
    (i32.const 0)
   )
   (set_local $14
    (i32.const 0)
   )
   (loop $label$1
    (block $label$2
     (block $label$3
      (block $label$4
       (block $label$5
        (block $label$6
         (block $label$7
          (br_if $label$7
           (tee_local $12
            (i32.lt_s
             (tee_local $10
              (i32.add
               (get_local $14)
               (i32.mul
                (get_local $5)
                (tee_local $9
                 (i32.div_s
                  (get_local $14)
                  (get_local $2)
                 )
                )
               )
              )
             )
             (i32.const 1)
            )
           )
          )
          (set_local $18
           (i32.const 0)
          )
          (block $label$8
           (br_if $label$8
            (i32.ge_s
             (get_local $9)
             (get_local $3)
            )
           )
           (br_if $label$8
            (i32.lt_s
             (get_local $9)
             (i32.const 0)
            )
           )
           (br_if $label$8
            (i32.gt_s
             (get_local $10)
             (get_local $2)
            )
           )
           (set_local $18
            (i32.load
             (i32.add
              (i32.add
               (get_local $0)
               (get_local $13)
              )
              (i32.const -4)
             )
            )
           )
          )
          (set_local $15
           (i32.add
            (get_local $9)
            (i32.const -1)
           )
          )
          (br_if $label$6
           (i32.gt_s
            (get_local $9)
            (get_local $3)
           )
          )
          (br_if $label$6
           (i32.lt_s
            (get_local $9)
            (i32.const 1)
           )
          )
          (br_if $label$6
           (i32.gt_s
            (get_local $10)
            (get_local $2)
           )
          )
          (set_local $18
           (i32.add
            (i32.load
             (i32.add
              (get_local $8)
              (get_local $13)
             )
            )
            (get_local $18)
           )
          )
          (br $label$6)
         )
         (set_local $15
          (i32.add
           (get_local $9)
           (i32.const -1)
          )
         )
         (set_local $18
          (i32.const 0)
         )
         (br_if $label$5
          (i32.lt_s
           (get_local $10)
           (i32.const 0)
          )
         )
        )
        (set_local $17
         (i32.const 0)
        )
        (set_local $16
         (i32.const 0)
        )
        (block $label$9
         (br_if $label$9
          (i32.ge_s
           (get_local $15)
           (get_local $3)
          )
         )
         (set_local $16
          (i32.const 0)
         )
         (br_if $label$9
          (i32.ge_s
           (get_local $10)
           (get_local $2)
          )
         )
         (set_local $16
          (i32.const 0)
         )
         (br_if $label$9
          (i32.lt_s
           (get_local $15)
           (i32.const 0)
          )
         )
         (set_local $16
          (i32.load
           (i32.add
            (get_local $0)
            (i32.add
             (get_local $13)
             (i32.mul
              (get_local $6)
              (i32.sub
               (get_local $15)
               (get_local $9)
              )
             )
            )
           )
          )
         )
        )
        (set_local $16
         (i32.add
          (get_local $16)
          (get_local $18)
         )
        )
        (br $label$4)
       )
       (set_local $16
        (i32.const 0)
       )
       (br_if $label$3
        (i32.ne
         (get_local $10)
         (i32.const -1)
        )
       )
       (set_local $17
        (i32.const 1)
       )
      )
      (set_local $11
       (i32.add
        (get_local $10)
        (i32.const 1)
       )
      )
      (set_local $19
       (i32.const 0)
      )
      (set_local $18
       (i32.const 0)
      )
      (block $label$10
       (br_if $label$10
        (i32.ge_s
         (get_local $15)
         (get_local $3)
        )
       )
       (set_local $18
        (i32.const 0)
       )
       (br_if $label$10
        (i32.ge_s
         (get_local $11)
         (get_local $2)
        )
       )
       (set_local $18
        (i32.const 0)
       )
       (br_if $label$10
        (i32.lt_s
         (get_local $15)
         (i32.const 0)
        )
       )
       (set_local $18
        (i32.load
         (i32.add
          (i32.add
           (get_local $0)
           (i32.add
            (get_local $13)
            (i32.mul
             (get_local $6)
             (i32.sub
              (get_local $15)
              (get_local $9)
             )
            )
           )
          )
          (i32.const 4)
         )
        )
       )
      )
      (set_local $15
       (i32.add
        (get_local $16)
        (get_local $18)
       )
      )
      (block $label$11
       (br_if $label$11
        (i32.ge_s
         (get_local $9)
         (get_local $3)
        )
       )
       (br_if $label$11
        (i32.lt_s
         (get_local $9)
         (i32.const 0)
        )
       )
       (br_if $label$11
        (i32.ge_s
         (get_local $11)
         (get_local $2)
        )
       )
       (set_local $19
        (i32.load
         (i32.add
          (i32.add
           (get_local $0)
           (get_local $13)
          )
          (i32.const 4)
         )
        )
       )
      )
      (set_local $15
       (i32.add
        (get_local $15)
        (get_local $19)
       )
      )
      (block $label$12
       (br_if $label$12
        (tee_local $18
         (i32.ge_s
          (i32.add
           (get_local $9)
           (i32.const 1)
          )
          (get_local $3)
         )
        )
       )
       (br_if $label$12
        (i32.lt_s
         (get_local $9)
         (i32.const -1)
        )
       )
       (br_if $label$12
        (i32.ge_s
         (get_local $11)
         (get_local $2)
        )
       )
       (set_local $15
        (i32.add
         (i32.load
          (i32.add
           (i32.add
            (get_local $7)
            (get_local $13)
           )
           (i32.const 4)
          )
         )
         (get_local $15)
        )
       )
      )
      (set_local $16
       (i32.const 0)
      )
      (block $label$13
       (br_if $label$13
        (get_local $17)
       )
       (set_local $16
        (i32.const 0)
       )
       (br_if $label$13
        (get_local $18)
       )
       (br_if $label$13
        (i32.ge_s
         (get_local $10)
         (get_local $2)
        )
       )
       (br_if $label$13
        (i32.lt_s
         (get_local $9)
         (i32.const -1)
        )
       )
       (set_local $16
        (i32.load
         (i32.add
          (get_local $7)
          (get_local $13)
         )
        )
       )
      )
      (set_local $16
       (i32.add
        (get_local $15)
        (get_local $16)
       )
      )
      (set_local $15
       (i32.const 0)
      )
      (br_if $label$2
       (get_local $12)
      )
      (br_if $label$2
       (get_local $18)
      )
      (br_if $label$2
       (i32.gt_s
        (get_local $10)
        (get_local $2)
       )
      )
      (br_if $label$2
       (i32.lt_s
        (get_local $9)
        (i32.const -1)
       )
      )
      (set_local $15
       (i32.load
        (i32.add
         (i32.add
          (get_local $7)
          (get_local $13)
         )
         (i32.const -4)
        )
       )
      )
      (br $label$2)
     )
     (set_local $15
      (i32.const 0)
     )
    )
    (i32.store
     (tee_local $18
      (i32.add
       (get_local $1)
       (get_local $13)
      )
     )
     (i32.load
      (tee_local $10
       (i32.add
        (get_local $0)
        (get_local $13)
       )
      )
     )
    )
    (set_local $9
     (i32.add
      (get_local $16)
      (get_local $15)
     )
    )
    (block $label$14
     (block $label$15
      (block $label$16
       (block $label$17
        (br_if $label$17
         (i32.ne
          (i32.load
           (get_local $10)
          )
          (i32.const 1)
         )
        )
        (br_if $label$16
         (i32.gt_s
          (get_local $9)
          (i32.const 1)
         )
        )
        (i32.store
         (get_local $18)
         (i32.const 0)
        )
        (br $label$14)
       )
       (br_if $label$15
        (i32.ge_s
         (get_local $9)
         (i32.const 3)
        )
       )
       (br $label$14)
      )
      (br_if $label$15
       (i32.eq
        (i32.or
         (get_local $9)
         (i32.const 1)
        )
        (i32.const 3)
       )
      )
      (br_if $label$14
       (i32.lt_s
        (get_local $9)
        (i32.const 4)
       )
      )
      (i32.store
       (get_local $18)
       (i32.const 0)
      )
      (br $label$14)
     )
     (i32.store
      (get_local $18)
      (i32.const 1)
     )
    )
    (set_local $13
     (i32.add
      (get_local $13)
      (i32.const 4)
     )
    )
    (br_if $label$1
     (i32.ne
      (get_local $4)
      (tee_local $14
       (i32.add
        (get_local $14)
        (i32.const 1)
       )
      )
     )
    )
   )
  )
 )
)
