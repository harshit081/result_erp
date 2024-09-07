const {Router} = require("express")
const controller = require('../controller/controller')
const router = Router()

router.get('/studentresult',controller.fetchresult)
router.post('/pushdata',controller.pushdata)
router.put('/blockresult',controller.blockresult)
router.put('/unblockresult',controller.unblockresult)
router.get('/fetchsemester',controller.fetchsemester)


module.exports = router;