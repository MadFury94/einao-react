export type LeadershipProfile = {
  id: string;
  name: string;
  role: string;
  credentials: string;
  bio: string;
  image: string;
  imageAlt: string;
};
export const defaultLeadershipProfile: LeadershipProfile = {
  id: 'collins-nkwoji',
  name: 'Collins Nkwoji',
  role: 'CEO',
  credentials: 'MBA, CPA, FCA, FCIT',
  bio: '',
  image: '/assets/images/ceo/tech-founder.png',
  imageAlt: 'Collins Nkwoji, CEO of Einao Solutions',
};
export function leadershipProfile(value?: Partial<LeadershipProfile>): LeadershipProfile {
  const image = value?.image?.trim();
  return {
    ...defaultLeadershipProfile,
    ...value,
    id: defaultLeadershipProfile.id,
    image: !image || image === '/assets/images/founder.webp' ? defaultLeadershipProfile.image : image,
  };
}
