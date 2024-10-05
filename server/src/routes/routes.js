const {Router} = require("express")
const controller = require('../controller/controller.js')
const router = Router()

router.get('/studentresult',controller.fetchResult)
router.post('/pushdata',controller.pushData)
router.put('/blockresult',controller.blockResult)
router.put('/unblockresult',controller.unblockResult)
router.get('/fetchsemester',controller.fetchSemester)
router.get('/fetchacadyear',controller.fetchAcadYear)
router.post('/check',controller.checkCourses)


module.exports = router;