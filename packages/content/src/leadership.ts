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
  image: '/assets/images/founder.webp',
  imageAlt: 'Collins Nkwoji, CEO of Einao Solutions',
};
export function leadershipProfile(value?: Partial<LeadershipProfile>): LeadershipProfile {
  return { ...defaultLeadershipProfile, ...value, id: defaultLeadershipProfile.id };
}
