/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StudentRecord, NotificationLog } from './types';

export const INITIAL_STUDENTS: StudentRecord[] = [
  {
    id: '01',
    profileUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlVrrj3hIaLPH0OS8qPzaosE7VaxhGnQjSV8qUCAAjNqScD7tjcPqfZUvOt-1EZXoyovo_TjAgz6otMtZMB-YHxbuOvGBhSbr4CkJ_yL-EBdWQqFZOvg35oeUo603k-cfKTXjf8LrPNAv6eBsemEpwoJYhcURULXWsNhXoFy4dcF9H64v1DcKWUDdOii_MfrvJFheYnKpREl-XVPc9htTCyy2JNG9BcCz7osmhzh1HV6sZzhwe6nXvxjRlakqXB2WGSO1r6XWYpWk',
    fullName: 'Ahmad Fauzi',
    email: 'afauzi@university.edu',
    gender: 'Male',
    hasHijab: false,
    userId: 'ST-202401',
    hasNametag: true,
    hasKemejaPutih: true,
    hasSabuk: true,
    hasKerudungPink: false,
    hasRokHitam: false,
    hasCelanaHitam: true,
    status: 'COMPLETE',
    timestamp: '2024-05-12 08:32:11'
  },
  {
    id: '02',
    profileUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1LdCj4IohLxh0NGH2xW4SiTKwuppNB5Jj9okIMUyfCPPazTvLcy7UQkCGo1MqtTSt8Wp3iCLA5hWKPKNJx4Ix_XjrICFioAW7Evk5OpdcvtMpyZEeXGezjLRBsLnsB3Z5ChHBJZ2OUGjdNDmVQDbVgNuD92XL55Tlu_Y3y7wBWJzo2yK5KpAXxv4nsvM2ZCaGc5FVajuSeEcPtoKxGpgp3dpYP4IPTfVDu0FRX_g0n1EmSQZUHykeyL0LteMw6UyIeRlwxQRXkPY',
    fullName: 'Siti Aminah',
    email: 's.aminah@university.edu',
    gender: 'Female',
    hasHijab: true,
    userId: 'ST-202408',
    hasNametag: true,
    hasKemejaPutih: true,
    hasSabuk: true,
    hasKerudungPink: false, // Discrepancy (pink hijab not detected)
    hasRokHitam: true,
    hasCelanaHitam: false,
    status: 'INCOMPLETE',
    timestamp: '2024-05-12 08:35:45'
  },
  {
    id: '03',
    profileUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFa5WQ0xpX-7Dl4olNUkjaA9K2dmNm8V7wgB0dAgZk7vv4g4nzBB_1AwWSjm8iE9qayAfUscyZmt8489R5PanHdzHGccomFjZCw-nBJUvrlZFDmA3Y8EVHkMuEeoO2NlaSNxWa2XtJ2YDYDjcHMlxsupJ1WsmmleMKVWGFe-ITpAsjtNfjcNr8-3bfppEnCl8jZgmJNnB2PILRa4pWCYx5nlGRIUls40J4ckw9ej7Ohn7YW9pwT5GgXv8Lyz2an9yHclGCVHJ-J7Y',
    fullName: 'Budi Santoso',
    email: 'budisan@university.edu',
    gender: 'Male',
    hasHijab: false,
    userId: 'ST-202415',
    hasNametag: true,
    hasKemejaPutih: true,
    hasSabuk: false, // Discrepancy (no belt/sabuk)
    hasKerudungPink: false,
    hasRokHitam: false,
    hasCelanaHitam: true,
    status: 'INCOMPLETE',
    timestamp: '2024-05-12 08:41:02'
  },
  {
    id: '04',
    profileUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtfDKkzDgS0ZMsrU5zpGL-yKtIpu-TL1b3zrR3k8Y2q1OcmYYeSoY5yddIeMVCsha11nx5Rpz2466BueiP_XgKQTlnfED9G9FN_-viK-HFvd4iG0sBka3gOvzLy-zpt4pnW0lxzgWLUOFwcIMiL4jiLCdCl3B1pnjqCUZs3uGyWSvomyMIYnpv69ROoqgwckbdS8E7iqLPQvGaN74Gm1byTcMSQ6mwJadcl7FVaIpqZKB0nDDe44QpKQTqTYDsT2vNx_zGlYnGFkY',
    fullName: 'Nur Haliza',
    email: 'nhaliza@university.edu',
    gender: 'Female',
    hasHijab: true,
    userId: 'ST-202422',
    hasNametag: true,
    hasKemejaPutih: true,
    hasSabuk: true,
    hasKerudungPink: true,
    hasRokHitam: true,
    hasCelanaHitam: false,
    status: 'COMPLETE',
    timestamp: '2024-05-12 09:05:33'
  },
  {
    id: '05',
    profileUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhPBj_Kdp_GLXyQBUOiERmRaDmk1aDScMdIAwoUSo_0E5483B3rkGgZKjS8FNeM8Zmr2xQcMwaYkTdP3D8SpQgLcnlzOLyl4WwauXrQN7_NhKVwR53KpONU-Qd-Z3dEbO3ApTpS9HtQezyntiUSDV1eE1MM3mtg6U9U-irOwqcsbCZAp8sRGloV6O_AGE1jEkwdWSMMhC4Foes0pruNb58YmJWuWSpcgL_L7SPPg_fNus6UbCW0lBdrzXFH0uOsICsys-l9A8jxkU',
    fullName: 'Eko Prasetyo',
    email: 'ekopr@university.edu',
    gender: 'Male',
    hasHijab: false,
    userId: 'ST-202431',
    hasNametag: true,
    hasKemejaPutih: true,
    hasSabuk: true,
    hasKerudungPink: false,
    hasRokHitam: false,
    hasCelanaHitam: true,
    status: 'COMPLETE',
    timestamp: '2024-05-12 09:12:18'
  }
];

export const INITIAL_EMAIL_LOGS: NotificationLog[] = [
  { recipient: 's.aminah@university.edu', type: 'Peringatan Atribut 1', status: 'SENT', timestamp: '2023-10-27 14:22' },
  { recipient: 'budisan@university.edu', type: 'Peringatan Atribut 2', status: 'SENT', timestamp: '2023-10-27 13:45' },
  { recipient: 's.aminah@university.edu', type: 'Peringatan Terakhir', status: 'FAILED', timestamp: '2023-10-27 12:10' },
  { recipient: 'budisan@university.edu', type: 'Peringatan Atribut 1', status: 'SENT', timestamp: '2023-10-27 11:30' },
  { recipient: 's.aminah@university.edu', type: 'Peringatan Atribut 2', status: 'SENT', timestamp: '2023-10-27 10:05' }
];

export const ASSET_URLS = {
  adminAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEIjeRgKzr_oV6AyNHSULkmpKCw_Euyhoyl1O6IqCU7xGQNWUiqdn2P_nTpVQ04L3EWJuwnXSRGPZpG6QrdHj3F_0q_XAk1Gp4iLvWz7tLDfLujYca9o7NP9Azur5Ubv5WttYEVEfMJewfmQonAsL5vcugOlYZfVRJ4FdV_icwvR1qEt35XWH-EX5vwy7ipXnp0QPP0dTpzSC8xx7aYJgZkHVnRjRAfFYEkcaL5CHMostzPZYxkBRVhgVMOt7e5xlCBX7WagiPOpk',
  dashboardVector: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDB-Az9z6_AdOD9s8o3VXp5hvIPTKAWG1M9HeHCGA9xHa8Fc__sEwtZQjKUxvj1q89CCNI2SxOWBH_Q6J1lb4_hqrypJhmfc-YFKHkqZp44ExfMIdn6xR4rEroGjRvxacNtMr5iX4nGaV6D5_CGoEc-IjM1JzzdwXRo6ss5Axg3ep4zjaHqeiZM0wa6Wjb6L2EGXZVQrQ82rwyT0TH8EJi_ht-sNn6m1YlwZShPZG9rxATDKoZEp7wnjD41V3WEyO-qCbtr1R5Uwvc',
  workstationVector: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8bnFrTbOetyVXd1x308dgCxvTYUCu5e05Qru8OaWyci0kh8ElZMIv1CmSB2Zf2JN1HkFJGXwMCb5MzamBa9IaQcrsLBTZ75o012rrZfvoIMlo89zR0iu_7poKBoS7jP6aBYLUDgRmum08gWFJWOpjg9e4OvMLex5QcASY4jI9ykNiTFUZP81A2lwMOlo8xkZ7erTx1yqajvnJSLOiUD3u55l_HAcHX4IeYV_jxEqavbyNssfR3uXoY39vU5XVnUgIxcHyCTo3n68',
  detectorScannerImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCZkv3pCl4rHddJEIQKrxaD8t6rOtBEt68j_lB58Y7rtWzSOXtsVExwCpfd9u2AswSPxARhHY4Y2dfY-6GhhH8ag93yaApaKu07DB2h7QGoBzgJ1xfrRjk3ecBZKu-0GqsBfgNZzuCQ6NLXlu-RWu8eE_QcvjkesWQpLNi3wIC7HCG0NfCaO5RzwwbJwGThj6JwgipGGWGwCAcX7rUUvpbZE8WAKLx9b7LJDTIVN8ZEFnvcplASJiwPUPqV7U-0_upOopvG2iglJM'
};
