declare interface StackOutputPair {
  OutputKey: string
  OutputValue: string
}

declare interface StackDescription {
  Outputs: StackOutputPair[]
}

declare interface StackDescriptionList {
  Stacks: StackDescription[]
}

declare interface OutputConfig {
  handler: string
  file: string
}