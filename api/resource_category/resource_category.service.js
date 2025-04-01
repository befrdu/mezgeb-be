const resourceCategoryDao = require('./resource_category.dao');

const getAllResourceCategories = (req, res) => {
    resourceCategoryDao.getResourceCategories((err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                success: 0,
                message: "Database connection error"
            });
        }
        return res.status(200).json({
            success: 1,
            data: results
        });
    });
}

const getResourceCategoryById = (req, res) => {
    const id = req.params.id;
    resourceCategoryDao.getResourceCategoryById(id, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                success: 0,
                message: "Database connection error"
            });
        }
        if (!result) {
            return res.status(404).json({
                success: 0,
                message: "Resource category not found"
            });
        }
        return res.status(200).json({
            success: 1,
            data: result
        });
    });
}

const createResourceCategory = (req, res) => {
    const body = req.body.category;
    const currentTime = new Date();

    body.createdDate = currentTime;
    resourceCategoryDao.createResourceCategory(body, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                success: 0,
                message: "Database connection error"
            });
        }
        return res.status(201).json({
            success: 1,
             message: "Resource category created successfully"
        });
    });
}

const updateResourceCategory = (req, res) => {
    const id = req.params.id;
    const body = req.body;
    resourceCategoryDao.updateResourceCategory(id, body, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                success: 0,
                message: "Database connection error"
            });
        }
        if (!result) {
            return res.status(404).json({
                success: 0,
                message: "Resource category not found"
            });
        }
        return res.status(200).json({
            success: 1,
            message: "Resource category updated successfully"
        });
    });
}

const deleteResourceCategory = (req, res) => {
    const id = req.params.id;
    resourceCategoryDao.deleteResourceCategory(id, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                success: 0,
                message: "Database connection error"
            });
        }
        if (!result) {
            return res.status(404).json({
                success: 0,
                message: "Resource category not found"
            });
        }
        return res.status(200).json({
            success: 1,
            message: "Resource category deleted successfully"
        });
    });
}

module.exports = {
    getAllResourceCategories,
    getResourceCategoryById,
    createResourceCategory,
    updateResourceCategory,
    deleteResourceCategory
};
