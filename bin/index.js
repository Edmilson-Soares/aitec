import env from 'dotenv'
import fs from 'fs'
env.config()

let system={}

  const package_=JSON.parse(fs.readFileSync(process.cwd()+'/package.json'))

  if(package_.aitec=='app'){
    system=(await import('./system.js')).default
  }else{
    system=(await import('./service_system.js')).default
  }




try {
  await system.start()


  process.on('uncaughtException', (error, origin) => {
    console.log(`\n${origin} signal received. \n${error}`)
})
// se nao tiver ele, o sistema joga um warn
process.on('unhandledRejection', (error) => {
    console.log(`\nunhandledRejection signal received. \n${error}`)
})
// ---- grafulshutdown

function grafulShutdown(event) {
return async(code) => {
    await system.stop()
    console.log(`${event} received! with ${code}`)
}
}

// Disparado no Ctrl + C no terminal -> multi plataforma
process.on('SIGINT', grafulShutdown('SIGINT'))

// Disparado no kill
process.on('SIGTERM', grafulShutdown('SIGTERM'))

process.on('exit', (code) => {
console.log('exit signal received', code)
})

} catch (error) {
  console.log(error)
  await system.stop()
}
 