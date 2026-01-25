export const queryString = (model, populate) => async (req, res, next) => {
    try {
        const {  page = 1, limit = 20, select, sort, ...filters } = req.query;
        // Convert
        let queryStr = JSON.stringify(filters);
            queryStr = queryStr.replace(
            /\b(gt|gte|lt|lte)\b/g,
            match => `$${match}`
        );
        let query = model.find(JSON.parse(queryStr));
        // Select
        if (select)
            query = query.select(select.split(",").join(" "));
        // Sort
        if (sort)
            query = query.sort(sort.split(",").join(" "));
        // Pagination
        query = query
            .skip((page - 1) * limit)
            .limit(Number(limit));
        if (populate)
            query = query.populate(populate);
        const results = await query;

        res.results = {
            success: true,
            count: results.length,
            data: results,
        };
        next();
    } catch (err) {
        next(err);
    }
};