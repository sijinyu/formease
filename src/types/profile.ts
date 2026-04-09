export interface UserProfile {
  readonly firstName: string;
  readonly lastName: string;
  readonly fullName: string;
  readonly email: string;
  readonly phone: string;
  readonly birthDate: string;
  readonly gender: string;
  readonly zipCode: string;
  readonly address: string;
  readonly addressDetail: string;
  readonly city: string;
  readonly company: string;
  readonly department: string;
  readonly position: string;
  readonly career: string;
  readonly selfIntro: string;
  readonly website: string;
  readonly github: string;
  readonly linkedin: string;
}

export type ProfileKey = keyof UserProfile;

export const PROFILE_KEYS: readonly ProfileKey[] = [
  "firstName",
  "lastName",
  "fullName",
  "email",
  "phone",
  "birthDate",
  "gender",
  "zipCode",
  "address",
  "addressDetail",
  "city",
  "company",
  "department",
  "position",
  "career",
  "selfIntro",
  "website",
  "github",
  "linkedin",
] as const;

export const EMPTY_PROFILE: UserProfile = {
  firstName: "",
  lastName: "",
  fullName: "",
  email: "",
  phone: "",
  birthDate: "",
  gender: "",
  zipCode: "",
  address: "",
  addressDetail: "",
  city: "",
  company: "",
  department: "",
  position: "",
  career: "",
  selfIntro: "",
  website: "",
  github: "",
  linkedin: "",
};

export const PROFILE_LABELS: Record<ProfileKey, string> = {
  firstName: "이름",
  lastName: "성",
  fullName: "성명",
  email: "이메일",
  phone: "전화번호",
  birthDate: "생년월일",
  gender: "성별",
  zipCode: "우편번호",
  address: "주소",
  addressDetail: "상세주소",
  city: "도시",
  company: "회사",
  department: "부서",
  position: "직책",
  career: "경력",
  selfIntro: "자기소개",
  website: "웹사이트",
  github: "GitHub",
  linkedin: "LinkedIn",
};
