import type { Posting, PlayerProfile, Application, Coach } from '../types';

export const mockPlayer: PlayerProfile = {
  id: 'player-1',
  name: 'Marcus Johnson',
  position: 'Point Guard',
  photo: '/IMG_1918.jpeg',
  school: 'Lincoln High School',
  height: "6'2\"",
  weight: 185,
  age: 17,
  location: 'Chicago, IL',
  classYear: 2025,
  evaluation: {
    level: 'D1 - Power 5',
    comparisons: ['Chris Paul', 'Kyrie Irving', 'Trae Young']
  },
  stats: {
    ppg: 22.4,
    rpg: 4.2,
    apg: 8.1,
    fgPercentage: 0.456,
    threePtPercentage: 0.382,
    steals: 2.3,
    blocks: 0.4
  }
};

export const mockPostings: Posting[] = [
  {
    id: 'posting-1',
    school: {
      id: 'school-1',
      name: 'University of Colorado',
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/38.png',
      division: 'D1',
      location: 'Boulder, CO',
      conference: 'Pac-12'
    },
    position: 'Utility Player',
    requirements: {
      height: 'Any height',
      classYear: 2025,
      gpa: 3.6
    },
    deadline: '2024-12-15',
    applicantCount: 12,
    matchScore: 87,
    description: 'Looking for a versatile player who can contribute in multiple positions.',
    coachName: 'Coach Smith',
    createdAt: '2024-11-01'
  },
  {
    id: 'posting-2',
    school: {
      id: 'school-2',
      name: 'Duke University',
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/150.png',
      division: 'D1',
      location: 'Durham, NC',
      conference: 'ACC'
    },
    position: 'Shooting Guard',
    requirements: {
      height: '6\'3" or taller',
      classYear: 2025,
      gpa: 3.8
    },
    deadline: '2024-12-20',
    applicantCount: 8,
    matchScore: 92,
    description: 'Elite shooting guard needed for championship run.',
    coachName: 'Coach Williams',
    createdAt: '2024-11-02'
  },
  {
    id: 'posting-3',
    school: {
      id: 'school-3',
      name: 'Gonzaga University',
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2250.png',
      division: 'D1',
      location: 'Spokane, WA',
      conference: 'WCC'
    },
    position: 'Point Guard',
    requirements: {
      height: '6\'0" or taller',
      classYear: 2025,
      gpa: 3.5
    },
    deadline: '2024-12-10',
    applicantCount: 15,
    matchScore: 78,
    description: 'Floor general needed to lead our offense.',
    coachName: 'Coach Few',
    createdAt: '2024-10-28'
  }
];

export const mockApplications: Application[] = [
  {
    id: 'app-1',
    posting: mockPostings[0],
    player: mockPlayer,
    status: 'pending',
    appliedAt: '2024-11-15',
    note: 'I am very interested in this program and would love to contribute to the team.'
  },
  {
    id: 'app-2',
    posting: mockPostings[1],
    player: mockPlayer,
    status: 'accepted',
    appliedAt: '2024-11-10',
    note: 'Thank you for considering my application.'
  },
  {
    id: 'app-3',
    posting: mockPostings[2],
    player: mockPlayer,
    status: 'rejected',
    appliedAt: '2024-11-05'
  }
];

// Coach-side mock data
export const mockCoachPostings: Posting[] = [
  {
    id: 'coach-posting-1',
    coachId: 'coach-1',
    school: {
      id: 'school-1',
      name: 'Duke University',
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/150.png',
      division: 'D1',
      location: 'Durham, NC',
      conference: 'ACC'
    },
    position: 'Point Guard',
    requirements: {
      height: '6\'0" or taller',
      classYear: 2025,
      gpa: 3.5
    },
    deadline: '2024-12-20',
    applicantCount: 12,
    description: 'Looking for a floor general to lead our offense.',
    coachName: 'Coach Williams',
    createdAt: '2024-11-01',
    status: 'active'
  },
  {
    id: 'coach-posting-2',
    coachId: 'coach-1',
    school: {
      id: 'school-1',
      name: 'Duke University',
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/150.png',
      division: 'D1',
      location: 'Durham, NC',
      conference: 'ACC'
    },
    position: 'Shooting Guard',
    requirements: {
      height: '6\'3" or taller',
      classYear: 2025,
      gpa: 3.8
    },
    deadline: '2024-12-15',
    applicantCount: 8,
    description: 'Elite shooter needed for championship run.',
    coachName: 'Coach Williams',
    createdAt: '2024-10-28',
    status: 'active'
  },
  {
    id: 'coach-posting-3',
    coachId: 'coach-1',
    school: {
      id: 'school-1',
      name: 'Duke University',
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/150.png',
      division: 'D1',
      location: 'Durham, NC',
      conference: 'ACC'
    },
    position: 'Center',
    requirements: {
      height: '6\'8" or taller',
      classYear: 2025,
      gpa: 3.2
    },
    deadline: '2024-11-30',
    applicantCount: 0,
    description: 'Big man to anchor our defense.',
    coachName: 'Coach Williams',
    createdAt: '2024-10-15',
    status: 'expired'
  }
];

export const mockCoachApplications: Application[] = [
  {
    id: 'coach-app-1',
    posting: mockCoachPostings[0],
    player: {
      ...mockPlayer,
      id: 'player-app-1',
      name: 'Marcus Johnson',
      position: 'Point Guard',
      school: 'Lincoln High School',
      stats: { ...mockPlayer.stats, ppg: 22.4, apg: 8.1 }
    },
    status: 'pending',
    appliedAt: '2024-11-15',
    note: 'I am very interested in this program and would love to contribute to the team.',
    matchScore: 89
  },
  {
    id: 'coach-app-2',
    posting: mockCoachPostings[0],
    player: {
      ...mockPlayer,
      id: 'player-app-2',
      name: 'Alex Thompson',
      position: 'Point Guard',
      school: 'Denver East High',
      stats: { ...mockPlayer.stats, ppg: 19.2, apg: 6.8 }
    },
    status: 'pending',
    appliedAt: '2024-11-12',
    note: 'Thank you for considering my application.',
    matchScore: 76
  },
  {
    id: 'coach-app-3',
    posting: mockCoachPostings[1],
    player: {
      ...mockPlayer,
      id: 'player-app-3',
      name: 'Jordan Williams',
      position: 'Shooting Guard',
      school: 'Cherry Creek High',
      stats: { ...mockPlayer.stats, ppg: 24.1, rpg: 5.2 }
    },
    status: 'accepted',
    appliedAt: '2024-11-08',
    reviewedAt: '2024-11-10',
    note: 'Excited about the opportunity!',
    matchScore: 92
  },
  {
    id: 'coach-app-4',
    posting: mockCoachPostings[1],
    player: {
      ...mockPlayer,
      id: 'player-app-4',
      name: 'David Chen',
      position: 'Shooting Guard',
      school: 'Boulder High School',
      stats: { ...mockPlayer.stats, ppg: 18.7, rpg: 4.1 }
    },
    status: 'rejected',
    appliedAt: '2024-11-05',
    reviewedAt: '2024-11-07',
    note: 'Thank you for your interest.',
    matchScore: 68
  }
];

export const mockCoaches: Coach[] = [
  {
    id: 'coach-1',
    name: 'Mike Krzyzewski',
    school: {
      id: 'school-1',
      name: 'Duke University',
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/150.png',
      division: 'D1',
      location: 'Durham, NC',
      conference: 'ACC'
    },
    position: 'Head Coach',
    photo: 'https://a.espncdn.com/i/headshots/ncaa/coaches/500/2.png',
    email: 'coach.k@duke.edu',
    phone: '(919) 555-0123',
    verified: true
  },
  {
    id: 'coach-2',
    name: 'Jon Scheyer',
    school: {
      id: 'school-1',
      name: 'Duke University',
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/150.png',
      division: 'D1',
      location: 'Durham, NC',
      conference: 'ACC'
    },
    position: 'Assistant Coach',
    photo: 'https://a.espncdn.com/i/headshots/ncaa/coaches/500/3.png',
    email: 'jon.scheyer@duke.edu',
    phone: '(919) 555-0124',
    verified: true
  },
  {
    id: 'coach-3',
    name: 'Nolan Smith',
    school: {
      id: 'school-1',
      name: 'Duke University',
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/150.png',
      division: 'D1',
      location: 'Durham, NC',
      conference: 'ACC'
    },
    position: 'Assistant Coach',
    photo: 'https://a.espncdn.com/i/headshots/ncaa/coaches/500/4.png',
    email: 'nolan.smith@duke.edu',
    phone: '(919) 555-0125',
    verified: true
  },
  {
    id: 'coach-4',
    name: 'Jeff Capel',
    school: {
      id: 'school-1',
      name: 'Duke University',
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/150.png',
      division: 'D1',
      location: 'Durham, NC',
      conference: 'ACC'
    },
    position: 'Associate Head Coach',
    photo: 'https://a.espncdn.com/i/headshots/ncaa/coaches/500/5.png',
    email: 'jeff.capel@duke.edu',
    phone: '(919) 555-0126',
    verified: true
  },
  {
    id: 'coach-5',
    name: 'Chris Carrawell',
    school: {
      id: 'school-1',
      name: 'Duke University',
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/150.png',
      division: 'D1',
      location: 'Durham, NC',
      conference: 'ACC'
    },
    position: 'Director of Recruiting',
    photo: 'https://a.espncdn.com/i/headshots/ncaa/coaches/500/6.png',
    email: 'chris.carrawell@duke.edu',
    phone: '(919) 555-0127',
    verified: true
  },
  {
    id: 'coach-6',
    name: 'Zach Edey',
    school: {
      id: 'school-1',
      name: 'Duke University',
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/150.png',
      division: 'D1',
      location: 'Durham, NC',
      conference: 'ACC'
    },
    position: 'Graduate Assistant',
    photo: 'https://a.espncdn.com/i/headshots/ncaa/coaches/500/7.png',
    email: 'zach.edey@duke.edu',
    phone: '(919) 555-0128',
    verified: true
  }
];
