import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  kakaoId: {
    type: String,
    required: true,
    unique: true
  },
  businessInfo: {
    address: String,                  // 소재지
    businessNumber: String,
    corporationNumber: String,        // 법인등록번호
    companyName: String,
    representativeName: String,
    openDate: String,
    businessType: String,
    businessCategory: String,        // 업태(업종) 
    taxType: String,                 // 과세 유형 (일반과세자, 간이과세자, 면세사업자)
    status: String,
    lastValidated: Date
  },
  preferences: {
    notifications: {
      type: Boolean,
      default: true
    },
    taxReminders: {
      type: Boolean,
      default: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 업데이트 시 updatedAt 자동 갱신
userSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const User = mongoose.model('User', userSchema); 