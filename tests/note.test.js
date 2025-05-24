const request = require("supertest");
const app = require("../app");

jest.mock("../utilities", () => ({
  authenticateToken: (req, res, next) => {
    req.user = {user: { _id: "test-user-id"}};
    next();
  }
}))


const Note = require("../models/note.model");
jest.mock("../models/note.model");

describe("NOTE ROUTES", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("POST /notes/add - thêm ghi chú thành công", async () => {
    const fakeNote = {
      _id: "note-id",
      title: "Ghi chú A",
      content: "Nội dung",
      tags: [],
      userId: "test-user-id"
    };

    Note.prototype.save = jest.fn().mockResolvedValue(fakeNote);

    const response = await request(app)
    .post("/notes/add")
    .send({
      title: "Ghi chú A",
      content: "Nội dung"
    });

    // console.log(response.body);

    expect(response.statusCode).toBe(200);
    expect(response.body.note.title).toBe("Ghi chú A");
  })

  test("GET /notes/get-all - danh sách ghi chú", async () => {
    const fakeNotes = [
      {_id: "1", title: "Note 1", content: "Content 1...", userId:"test-user-id", isPinned: true},
      {_id: "2", title: "Note 2", content: "Content 2...", userId:"test-user-id", isPinned: false},
    ];

    Note.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue(fakeNotes)
    });

    const response = await request(app).get("/notes/get-all");
    expect(response.statusCode).toBe(200);
    expect(response.body.notes.length).toBe(2);
  })

  test("DELETE /notes/delete/:id - xóa ghi chú", async () => {
    Note.findOne = jest.fn().mockResolvedValue({_id: "1", userId: "test-user-id"});
    Note.deleteOne = jest.fn().mockResolvedValue({});

    const res = await request(app).delete("/notes/delete/1");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Xóa ghi chú thành công");
  })

  test("PATCH /notes/update-pinned/:id - pin hoặc unpin ghi chú thành công", async () => {
    const fakeNote = {_id: "note1", userId: "test-user-id", isPinned: false};

    Note.findOne = jest.fn().mockResolvedValue(fakeNote);
    Note.updateOne = jest.fn().mockResolvedValue({modifiedCount: 1});

    const res = await request(app).patch("/notes/update-pinned/note1");

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Ghim thành công");
  })

  test("PATCH /notes/update-pinned/:id - báo lỗi khi không tìm thấy ghi chú", async () => {
    Note.findOne = jest.fn().mockResolvedValue(null);

    const res = await request(app).patch("/notes/update-pinned/invalid-id");

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Không tìm thấy ghi chú");
  })

  test("PATCH /notes/edit/:id - cập nhật ghi chú thành công", async () => {
    Note.updateOne = jest.fn().mockResolvedValue({modifiedCount: 1});   // cap nhat ghi chu thanh cong voi 1 ban thay doi

    const updateFakeNote = {
      _id: "note-edit",
      title: "Updated Title",
      content: "Updated Content",
      tags: ["tag1"],
      userId: "test-user-id"
    }

    Note.findOne = jest.fn().mockResolvedValue(updateFakeNote);

    const res = await request(app)
    .patch("/notes/edit/note-edit")
    .send({title: "Updated Title", content: "Updated Content", tags: ["tag1"]});

    expect(res.statusCode).toBe(200);
    expect(res.body.note.title).toBe("Updated Title");
    expect(res.body.message).toBe("Cập nhật ghi chú thành công");
  })

  test("PATCH /notes/edit/:id - Báo lỗi khi không có nội dung thay đổi", async () => {
    const res = await request(app)
    .patch("/notes/edit/note-edit")
    .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Không có nội dung thay đổi");
  })

  test("GET /notes/searching?query=Test - tìm kiếm ghi chú thành công", async () => {
    const fakeNotes = [
      { _id: "1", title: "Test note", content: "Some content", tags: [] , userId: "test-user-id"}
    ];

    Note.find = jest.fn().mockResolvedValue(fakeNotes);

    const res = await request(app)
    .get("/notes/searching?query=Test")

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.notes)).toBe(true);
    expect(res.body.notes.length).toBe(1);
    expect(res.body.message).toBe("Tìm kiếm thành công");
  })

  test("GET /notes/searching - báo lỗi khi không cung cấp query", async () => {

    const res = await request(app)
      .get("/notes/searching")

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Không có nội dung tìm kiếm");
  });

})

