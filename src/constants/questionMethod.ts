export enum QuestionMethodEnum {
    TextRandom = 1,        // Nhập văn bản/số và lấy ngẫu nhiên trong khoảng (from-to)
    SelectRandom = 2,      // Chọn từ danh sách và lấy ngẫu nhiên theo Index tương ứng
    SliderOffset = 3,      // Tính toán dựa trên độ lệch (offset) so với khoảng lý tưởng (Dùng cho Giấc ngủ)
    ValueMatch = 4,        // Khớp giá trị cụ thể hoặc tập hợp giá trị (Dùng cho Số bữa ăn)
}