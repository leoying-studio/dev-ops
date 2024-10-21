const express = require('express');
const app = express();
const router = express.Router();

router.get("/connection/view", (req, res) => {
    res.render("admin/pages/busConnection");
})

module.exports = router;