import cron from 'cron';


export default () => (cronJob) => ({
    name: cronJob.name,
    state: cronJob.state,
    job: new cron.CronJob(cronJob.time, cronJob.execute, null, cronJob.state)

})