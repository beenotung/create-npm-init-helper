import { hasExec } from '../src/helpers'

let names = [
  'pnpm',
  'slnpm',
  'npm',
  'yarn',
  'bower',
  'webpack',
  'snowpack',
  'ts-node',
  'tsc',
  'mocha',
  'ts-mocha',
]

let hasList: string[] = []
let noList: string[] = []
for (let name of names) {
  ;(hasExec(name) ? hasList : noList).push(name)
}

console.log('has:', hasList)
console.log('no:', noList)
