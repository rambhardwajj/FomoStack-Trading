import cron from 'node-cron';
import axios from 'axios';


cron.schedule('* 1 * * *', () => {
  console.log('running a task every minute');

    try {
        const res = axios.get('http://localhost:4000/api/v1/orders/liquidate')
    } catch (error) {
        
    }

});