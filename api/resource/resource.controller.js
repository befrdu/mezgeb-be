const express = require('express');
const {
    createResource,
    getResourceById,
    getAllResources,
    updateResource,
    deleteResource,
    getResourcesByCategory,
    getResourcesByStatus,
    getResourcesByAcquiredBy,
    getResourcesByCreatedBy,
    bulkCreateResource,
    searchResourcesByCategory,
    searchResourcesByDate
} = require('./resource.service');
const router = express.Router();
const { checkToken } = require('../../auth/token_validation');

/* Protected api */
router.post('/', checkToken, createResource);
router.post('/search-by-category', checkToken, searchResourcesByCategory);
router.post('/search-by-date', checkToken, searchResourcesByDate);
router.post('/bulk', checkToken, bulkCreateResource);
router.get('/', checkToken, getAllResources);
router.get('/:id', checkToken, getResourceById);
router.post('/by-category', checkToken, getResourcesByCategory);
router.post('/by-status', checkToken, getResourcesByStatus);
router.post('/by-acquired-by', checkToken, getResourcesByAcquiredBy);
router.post('/by-created-by', checkToken, getResourcesByCreatedBy);
router.patch('/:id', checkToken, updateResource);
router.delete('/:id', checkToken, deleteResource);

/*----------------------------------------------------*/

module.exports = router;