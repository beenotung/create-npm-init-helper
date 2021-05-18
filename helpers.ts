import degit from 'degit'
import * as fs from 'fs'
import { ReadStream, WriteStream } from 'fs'
import * as path from 'path'
import * as readline from 'readline'

export async function cloneGitRepo(options: {
  src: string // e.g. https://github.com/beenotung/cs-gen#template-macro
  degitOptions?: degit.Options
  showLog?: boolean
  showWarn?: boolean
  dest: string // path of output folder
}) {
  if (options.showLog) {
    console.log('Cloning from', options.src, '...')
  }
  let git = degit(options.src, options.degitOptions)
  if (options.showWarn) {
    git.on('warn', info => console.error(info.message))
  }
  await git.clone(options.dest)
}

export async function getDest(options?: {
  input?: ReadStream // default process.stdin
  output?: WriteStream // default process.stdout
  name?: string // default 'project directory'
}) {
  options = options || {}
  let input = options.input || process.stdin
  let output = options.output || process.stdout
  let name = options.name || 'project directory'
  let question = name + ': '

  let dest = process.argv[2]
  if (!dest) {
    let io = readline.createInterface({
      input,
      output,
    })
    dest = await new Promise(resolve => io.question(question, resolve))
    io.close()
  }
  if (!dest) {
    console.error('Please specify the', name)
    process.exit(1)
  }
  if (fs.existsSync(dest)) {
    console.error('Error:', dest, 'already exists')
    process.exit(1)
  }
  return dest
}

export async function cloneTemplate(options: {
  dest?: string // can be obtained from `getDest()`
  gitSrc: string // e.g. https://github.com/beenotung/cs-gen#template-macro
  srcDir: string // e.g. template/demo-server
  showLog?: boolean
  showWarn?: boolean
}) {
  let dest = options.dest || (await getDest())
  let repoDir = fs.mkdtempSync(dest + '.tmp')
  await cloneGitRepo({
    src: options.gitSrc,
    dest: repoDir,
    showLog: options.showLog,
    showWarn: options.showWarn,
  })
  try {
    if (options.showLog) {
      console.log('Creating a new project in', dest, '...')
    }
    let src = path.join(repoDir, options.srcDir)
    fs.renameSync(src, dest)
  } catch (error) {
    fs.rmdirSync(repoDir, { recursive: true })
  }
}
