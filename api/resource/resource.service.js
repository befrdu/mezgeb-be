const { createResource, getAll, getById, update, delete: deleteResource, getByAcquiredBy, getByCreatedBy, getByCategory, getByStatus, searchResourcesByCategory, searchResourcesByDate} = require('./resource.dao');

module.exports = {
    createResource: (req, res) => {
        const body = req.body;
        
        const currentTime = new Date();

        body.createdDate = currentTime;
        body.status = 'Created';

        createResource(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                });
            }
            return res.status(200).json({
                success: 1,
                message: "Resource created successfully"
            });
        });
    },

    bulkCreateResource: (req, res) => {
        const resources = req.body.resources;
     
        let successCount = 0;

        resources.forEach((resource, index) => {
            const currentTime = new Date();

            resource.createdDate = currentTime;
            resource.status = 'Created';

            createResource(resource, (err, results) => {
                if (err) {
                    console.log(`Error saving expense at index ${index}:`, err);
                    return res.status(500).json({
                        error:err,
                        message:'Process failed!'
                    })
                } else {
                    ++successCount;
                }

                // Send response after processing all expenses
                if (index === resources.length - 1) {
                    return res.status(200).json({
                        success: 1,
                        successfulySavedRecordCount: `${successCount}`,
                        message: `${successCount} resources created successfully`
                    });
                }
            });
        });
    },

    getResourceById: (req, res) => {
        const id = req.params.id;

        getById(id, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                });
            }
            if (!results) {
                return res.status(404).json({
                    success: 0,
                    message: "Resource not found"
                });
            }
            return res.status(200).json({
                success: 1,
                data: results
            });
        });
    },
    getAllResources: (req, res) => {
        getAll((err, results) => {
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
    },
    updateResource: (req, res) => {
        const body = req.body;
        const id = req.params.id;

        body.id = id;

        update(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                });
            }
            return res.status(200).json({
                success: 1,
                message: "Resource updated successfully"
            });
        });
    },
    deleteResource: (req, res) => {
        const id = req.params.id;

        deleteResource(id, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                });
            }
            return res.status(200).json({
                success: 1,
                message: "Resource deleted successfully"
            });
        });
    },
    getResourcesByCategory: (req, res) => {
        const category = req.params.category;

        getByCategory(category, (err, results) => {
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
    },
    getResourcesByStatus: (req, res) => {
        const status = req.params.status;

        getByStatus(status, (err, results) => {
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
    },
    getResourcesByAcquiredBy: (req, res) => {
        const acquiredBy = req.params.acquiredBy;

        getByAcquiredBy(acquiredBy, (err, results) => {
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
    },
    getResourcesByCreatedBy: (req, res) => {
        const createdBy = req.params.createdBy;

        getByCreatedBy(createdBy, (err, results) => {
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
    },

    searchResourcesByCategory: (req, res) => {
        const query = req.body.request;

        searchResourcesByCategory(query, (err, results) => {
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
    },

    searchResourcesByDate: (req, res) => {
        const query = req.body.request;

        searchResourcesByDate(query, (err, results) => {
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
}