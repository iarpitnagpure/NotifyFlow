export const notifyController = (req, res) => {
    const { userId, type, message } = req.body;

    res.json({
        status: 'accepted',
        data: { userId, type, message }
    });
};

