(module
  (import "env" "log" (func $log) (param i32))
  (type (;0;) (func (result i32)))
  (type (;1;) (func (param i32 i32 i32 i32 i32) (result i32)))
  (type (;2;) (func (param i32 i32 i32 i32)))
  (func (;0;) (type 0) (result i32)
    i32.const 42)
  (func (;1;) (type 1) (param i32 i32 i32 i32 i32) (result i32)
    (local i32)
    i32.const 0
    local.set 5
    block  ;; label = @1
      local.get 1
      i32.const 0
      i32.lt_s
      br_if 0 (;@1;)
      i32.const 0
      local.set 5
      local.get 2
      i32.const 0
      i32.lt_s
      br_if 0 (;@1;)
      local.get 1
      local.get 3
      i32.ge_s
      br_if 0 (;@1;)
      local.get 2
      local.get 4
      i32.ge_s
      br_if 0 (;@1;)
      local.get 0
      local.get 3
      local.get 2
      i32.mul
      local.get 1
      i32.add
      i32.const 2
      i32.shl
      i32.add
      i32.load
      local.set 5
    end
    local.get 5)
  (func (;2;) (type 2) (param i32 i32 i32 i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)
    block  ;; label = @1
      local.get 3
      local.get 2
      i32.mul
      local.tee 4
      i32.const 1
      i32.lt_s
      br_if 0 (;@1;)
      i32.const 0
      local.get 2
      i32.sub
      local.set 5
      local.get 0
      local.get 2
      i32.const 2
      i32.shl
      local.tee 6
      i32.add
      local.set 7
      local.get 0
      i32.const -4
      local.get 6
      i32.sub
      i32.add
      local.set 8
      i32.const 0
      local.set 13
      i32.const 0
      local.set 14
      loop  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              block  ;; label = @6
                block  ;; label = @7
                  block  ;; label = @8
                    local.get 14
                    local.get 5
                    local.get 14
                    local.get 2
                    i32.div_s
                    local.tee 9
                    i32.mul
                    i32.add
                    local.tee 10
                    i32.const 1
                    i32.lt_s
                    local.tee 12
                    br_if 0 (;@8;)
                    i32.const 0
                    local.set 18
                    block  ;; label = @9
                      local.get 9
                      local.get 3
                      i32.ge_s
                      br_if 0 (;@9;)
                      local.get 9
                      i32.const 0
                      i32.lt_s
                      br_if 0 (;@9;)
                      local.get 10
                      local.get 2
                      i32.gt_s
                      br_if 0 (;@9;)
                      local.get 0
                      local.get 13
                      i32.add
                      i32.const -4
                      i32.add
                      i32.load
                      local.set 18
                    end
                    local.get 9
                    i32.const -1
                    i32.add
                    local.set 15
                    local.get 9
                    local.get 3
                    i32.gt_s
                    br_if 1 (;@7;)
                    local.get 9
                    i32.const 1
                    i32.lt_s
                    br_if 1 (;@7;)
                    local.get 10
                    local.get 2
                    i32.gt_s
                    br_if 1 (;@7;)
                    local.get 8
                    local.get 13
                    i32.add
                    i32.load
                    local.get 18
                    i32.add
                    local.set 18
                    br 1 (;@7;)
                  end
                  local.get 9
                  i32.const -1
                  i32.add
                  local.set 15
                  i32.const 0
                  local.set 18
                  local.get 10
                  i32.const 0
                  i32.lt_s
                  br_if 1 (;@6;)
                end
                i32.const 0
                local.set 17
                i32.const 0
                local.set 16
                block  ;; label = @7
                  local.get 15
                  local.get 3
                  i32.ge_s
                  br_if 0 (;@7;)
                  i32.const 0
                  local.set 16
                  local.get 10
                  local.get 2
                  i32.ge_s
                  br_if 0 (;@7;)
                  i32.const 0
                  local.set 16
                  local.get 15
                  i32.const 0
                  i32.lt_s
                  br_if 0 (;@7;)
                  local.get 0
                  local.get 13
                  local.get 6
                  local.get 15
                  local.get 9
                  i32.sub
                  i32.mul
                  i32.add
                  i32.add
                  i32.load
                  local.set 16
                end
                local.get 16
                local.get 18
                i32.add
                local.set 16
                br 1 (;@5;)
              end
              i32.const 0
              local.set 16
              local.get 10
              i32.const -1
              i32.ne
              br_if 1 (;@4;)
              i32.const 1
              local.set 17
            end
            local.get 10
            i32.const 1
            i32.add
            local.set 11
            i32.const 0
            local.set 19
            i32.const 0
            local.set 18
            block  ;; label = @5
              local.get 15
              local.get 3
              i32.ge_s
              br_if 0 (;@5;)
              i32.const 0
              local.set 18
              local.get 11
              local.get 2
              i32.ge_s
              br_if 0 (;@5;)
              i32.const 0
              local.set 18
              local.get 15
              i32.const 0
              i32.lt_s
              br_if 0 (;@5;)
              local.get 0
              local.get 13
              local.get 6
              local.get 15
              local.get 9
              i32.sub
              i32.mul
              i32.add
              i32.add
              i32.const 4
              i32.add
              i32.load
              local.set 18
            end
            local.get 16
            local.get 18
            i32.add
            local.set 15
            block  ;; label = @5
              local.get 9
              local.get 3
              i32.ge_s
              br_if 0 (;@5;)
              local.get 9
              i32.const 0
              i32.lt_s
              br_if 0 (;@5;)
              local.get 11
              local.get 2
              i32.ge_s
              br_if 0 (;@5;)
              local.get 0
              local.get 13
              i32.add
              i32.const 4
              i32.add
              i32.load
              local.set 19
            end
            local.get 15
            local.get 19
            i32.add
            local.set 15
            block  ;; label = @5
              local.get 9
              i32.const 1
              i32.add
              local.get 3
              i32.ge_s
              local.tee 18
              br_if 0 (;@5;)
              local.get 9
              i32.const -1
              i32.lt_s
              br_if 0 (;@5;)
              local.get 11
              local.get 2
              i32.ge_s
              br_if 0 (;@5;)
              local.get 7
              local.get 13
              i32.add
              i32.const 4
              i32.add
              i32.load
              local.get 15
              i32.add
              local.set 15
            end
            i32.const 0
            local.set 16
            block  ;; label = @5
              local.get 17
              br_if 0 (;@5;)
              i32.const 0
              local.set 16
              local.get 18
              br_if 0 (;@5;)
              local.get 10
              local.get 2
              i32.ge_s
              br_if 0 (;@5;)
              local.get 9
              i32.const -1
              i32.lt_s
              br_if 0 (;@5;)
              local.get 7
              local.get 13
              i32.add
              i32.load
              local.set 16
            end
            local.get 15
            local.get 16
            i32.add
            local.set 16
            i32.const 0
            local.set 15
            local.get 12
            br_if 1 (;@3;)
            local.get 18
            br_if 1 (;@3;)
            local.get 10
            local.get 2
            i32.gt_s
            br_if 1 (;@3;)
            local.get 9
            i32.const -1
            i32.lt_s
            br_if 1 (;@3;)
            local.get 7
            local.get 13
            i32.add
            i32.const -4
            i32.add
            i32.load
            local.set 15
            br 1 (;@3;)
          end
          i32.const 0
          local.set 15
        end
        local.get 1
        local.get 13
        i32.add
        local.tee 18
        local.get 0
        local.get 13
        i32.add
        local.tee 10
        i32.load
        i32.store
        local.get 16
        local.get 15
        i32.add
        local.set 9
        block  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              block  ;; label = @6
                local.get 10
                i32.load
                i32.const 1
                i32.ne
                br_if 0 (;@6;)
                local.get 9
                i32.const 1
                i32.gt_s
                br_if 1 (;@5;)
                local.get 18
                i32.const 0
                i32.store
                br 3 (;@3;)
              end
              local.get 9
              i32.const 3
              i32.ge_s
              br_if 1 (;@4;)
              br 2 (;@3;)
            end
            local.get 9
            i32.const 1
            i32.or
            i32.const 3
            i32.eq
            br_if 0 (;@4;)
            local.get 9
            i32.const 4
            i32.lt_s
            br_if 1 (;@3;)
            local.get 18
            i32.const 0
            i32.store
            br 1 (;@3;)
          end
          local.get 18
          i32.const 1
          i32.store
        end
        local.get 13
        i32.const 4
        i32.add
        local.set 13
        local.get 4
        local.get 14
        i32.const 1
        i32.add
        local.tee 14
        i32.ne
        br_if 0 (;@2;)
      end
    end)
  (table (;0;) 0 funcref)
  (memory (;0;) 1)
  (export "memory" (memory 0))
  (export "main" (func 0))
  (export "checkStatus" (func 1))
  (export "simulate" (func 2)))
