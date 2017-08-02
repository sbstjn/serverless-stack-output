declare interface StackOutput {
  OutputKey: string
  OutputValue: string
}

declare interface StackDescription {
  Outputs: StackOutput[]
}

declare interface StackDescriptionList {
  Stacks: StackDescription[]
}

declare interface OutputConfig {
  handler: string
  file: string
}

declare interface CustomConfig {
  output: OutputConfig
}