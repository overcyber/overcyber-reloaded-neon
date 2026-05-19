#![no_std]

#[macro_export]
macro_rules! new {
    ($mod_name:ident, $($tf:tt),+ $(,)?) => {
        mod $mod_name {
            #[derive(Copy, Clone, Debug)]
            pub struct InitToken(());

            impl InitToken {
                #[inline(always)]
                pub fn init() -> Self {
                    init()
                }

                #[inline(always)]
                pub fn init_get() -> (Self, bool) {
                    init_get()
                }

                #[inline(always)]
                pub fn get(&self) -> bool {
                    false
                }
            }

            #[inline(always)]
            pub fn init_get() -> (InitToken, bool) {
                (InitToken(()), false)
            }

            #[inline(always)]
            pub fn init() -> InitToken {
                InitToken(())
            }

            #[inline(always)]
            pub fn get() -> bool {
                false
            }
        }
    };
}
