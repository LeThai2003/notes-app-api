const Note = require("../models/note.model");

// [POST] /notes/add
module.exports.addNotePost = async (req, res) => {
    const {title, content, tags} = req.body;
    const {user} = req.user;

    if(!title)
    {
        return res.status(400).json({error: true, message: "Tiêu đề không được tróng"});
    }

    if(!content)
    {
        return res.status(400).json({error: true, message: "Nội dung không được tróng"});
    }

    try {
        const note = new Note({
            title,
            content,
            tags: tags || [],
            userId: user._id
        })

        await note.save();

        return res.json({
            error: false,
            note,
            message: "Tạo ghi chú thành công"
        })
    } catch (error) {
        return res.status(500).json({error: true, message: "Lỗi hệ thống"});
    }
}

//[PATCH] notes/edit/:id
module.exports.editNote = async (req, res) => {
    const {title, content, tags, isPinned} = req.body;
    const {user} = req.user;

    const id = req.params.id;

    if(!title && !content && !tags)
    {
        return res.status(400).json({error: true, message: "Không có nội dung thay đổi"});
    }

    try {
        await Note.updateOne({
            _id: id,
            userId: user._id
        },{
            ...req.body   
        })

        const note = await Note.findOne({_id: id}); 

        return res.json({
            error: false,
            note,
            message: "Cập nhật ghi chú thành công"
        })
    } catch (error) {
        return res.status(500).json({error: true, message: "Lỗi hệ thống"});
    }

}

//[GET] /notes/get-all
module.exports.getAllNotes = async (req, res) => {
    const {user} = req.user;

    try {
        const notes = await Note.find({userId: user._id}).sort({isPinned: -1});

        return res.json({
            error: false,
            notes,
            message: "Lấy tất cả ghi chú thành công"
        })
    } catch (error) {
        return res.status(500).json({error: true, message: "Lỗi hệ thống"});
    }
}

// [DELETE] /notes/delete/:id
module.exports.deleteNote = async (req, res) => {
    const id = req.params.id;
    const {user} = req.user;

    try {
        const note = await Note.findOne({_id: id, userId: user._id});

        if(!note)
        {
            return res.status(400).json({error: true, message: "Không tìm thấy ghi chú"});
        }

        await Note.deleteOne({_id: id, userId: user._id});

        return res.json({error: false, message: "Xóa ghi chú thành công"});
    } catch (error) {
        return res.status(500).json({error: true, message: "Lỗi hệ thống"});
    }
}

// [PATCH] /notes/update-pinned/:id
module.exports.updatePinned = async (req, res) => {
    const noteId = req.params.id;
    const {user} = req.user;

    try {
        const note = await Note.findOne({_id: noteId, userId: user._id});

        if(!note)
        {
            return res.status(400).json({error: true, message: "Không tìm thấy ghi chú"});
        }

        const isPinned = note.isPinned;

        await Note.updateOne({
            _id: noteId,
            userId: user._id
        }, {
            isPinned: !isPinned
        });

        const responseMessage = (isPinned == true ? "Bỏ ghim thành công" : "Ghim thành công")

        return res.json({error: false, message: responseMessage});
    } catch (error) {
        return res.status(500).json({error: true, message: "Lỗi hệ thống" + error});
    }

}

// [GET] /notes/searching
module.exports.searchNote = async (req, res) => {
    const {user} = req.user;
    const {query} = req.query;

    if(!query)
    {
        return res.status(400).json({error: true, message: "Không có nội dung tìm kiếm"});
    }

    try {
        const notes = await Note.find({
            userId: user._id,
            $or: [
                {title: {$regex: new RegExp(query, "i")}},
                {content: {$regex: new RegExp(query, "i")}},
                {tags: {$regex: new RegExp(query, "i") }}
            ]
        })

        return res.json({
            error: false,
            notes: notes,
            message: "Tìm kiếm thành công"
        })
    } catch (error) {
        return res.status(500).json({error: true, message: "Lỗi hệ thống" + error});
    }
}