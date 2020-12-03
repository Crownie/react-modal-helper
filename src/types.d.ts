//workaround https://github.com/avajs/ava/issues/2332#issuecomment-570442898
declare interface SymbolConstructor {
  readonly observable: symbol;
}
