import { UserProfile, ProfileKey } from "@/types/profile";
import FormSection from "./FormSection";
import InputField from "./InputField";
import TextAreaField from "./TextAreaField";

interface ProfileFormProps {
  readonly profile: UserProfile;
  readonly onChange: (key: ProfileKey, value: string) => void;
}

function ProfileForm({ profile, onChange }: ProfileFormProps) {
  return (
    <div>
      <FormSection title="기본 정보" defaultOpen>
        <div className="grid grid-cols-2 gap-2">
          <InputField
            label="성"
            value={profile.lastName}
            onChange={(v) => onChange("lastName", v)}
            placeholder="홍"
          />
          <InputField
            label="이름"
            value={profile.firstName}
            onChange={(v) => onChange("firstName", v)}
            placeholder="길동"
          />
        </div>
        <InputField
          label="성명"
          value={profile.fullName}
          onChange={(v) => onChange("fullName", v)}
          placeholder="홍길동"
        />
        <InputField
          label="이메일"
          value={profile.email}
          onChange={(v) => onChange("email", v)}
          placeholder="hong@example.com"
          type="email"
        />
        <InputField
          label="전화번호"
          value={profile.phone}
          onChange={(v) => onChange("phone", v)}
          placeholder="010-1234-5678"
          type="tel"
        />
      </FormSection>

      <FormSection title="주소">
        <InputField
          label="우편번호"
          value={profile.zipCode}
          onChange={(v) => onChange("zipCode", v)}
          placeholder="12345"
        />
        <InputField
          label="주소"
          value={profile.address}
          onChange={(v) => onChange("address", v)}
          placeholder="서울시 강남구 역삼동"
        />
        <InputField
          label="상세주소"
          value={profile.addressDetail}
          onChange={(v) => onChange("addressDetail", v)}
          placeholder="123호"
        />
        <InputField
          label="도시"
          value={profile.city}
          onChange={(v) => onChange("city", v)}
          placeholder="서울"
        />
      </FormSection>

      <FormSection title="직장/경력">
        <InputField
          label="회사"
          value={profile.company}
          onChange={(v) => onChange("company", v)}
          placeholder="회사명"
        />
        <InputField
          label="부서"
          value={profile.department}
          onChange={(v) => onChange("department", v)}
          placeholder="개발팀"
        />
        <InputField
          label="직책"
          value={profile.position}
          onChange={(v) => onChange("position", v)}
          placeholder="시니어 개발자"
        />
        <TextAreaField
          label="경력"
          value={profile.career}
          onChange={(v) => onChange("career", v)}
          placeholder="주요 경력 사항을 입력하세요"
        />
      </FormSection>

      <FormSection title="자기소개">
        <TextAreaField
          label="자기소개"
          value={profile.selfIntro}
          onChange={(v) => onChange("selfIntro", v)}
          placeholder="간단한 자기소개를 입력하세요"
          rows={4}
        />
      </FormSection>

      <FormSection title="링크">
        <InputField
          label="웹사이트"
          value={profile.website}
          onChange={(v) => onChange("website", v)}
          placeholder="https://example.com"
          type="url"
        />
        <InputField
          label="GitHub"
          value={profile.github}
          onChange={(v) => onChange("github", v)}
          placeholder="https://github.com/username"
          type="url"
        />
        <InputField
          label="LinkedIn"
          value={profile.linkedin}
          onChange={(v) => onChange("linkedin", v)}
          placeholder="https://linkedin.com/in/username"
          type="url"
        />
      </FormSection>

      <FormSection title="기타">
        <InputField
          label="생년월일"
          value={profile.birthDate}
          onChange={(v) => onChange("birthDate", v)}
          placeholder="1990-01-01"
          type="date"
        />
        <InputField
          label="성별"
          value={profile.gender}
          onChange={(v) => onChange("gender", v)}
          placeholder="남성 / 여성"
        />
      </FormSection>
    </div>
  );
}

export default ProfileForm;
