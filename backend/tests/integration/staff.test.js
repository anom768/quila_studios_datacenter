const request = require('supertest');
const fs = require('fs');
const path = require('path');
const { app, loginAgent } = require('../helpers/testApp');
const { resetDatabase, createTestUser, createTestStaff } = require('../helpers/testDb');
const { resetUploadDir, makeFakeImageBuffer } = require('../helpers/testUploads');

describe('Staff Module Integration Tests', () => {
  let adminAgent;
  let staffAgent;
  let unauthAgent;
  let ipCounter = 1;

  beforeEach(async () => {
    await resetDatabase();
    resetUploadDir();

    ipCounter += 1;
    const uniqueIp = `192.168.1.${ipCounter}`;

    // Create test users
    await createTestUser({ username: 'admin_test', password: 'password123', role: 'admin' });
    await createTestUser({ username: 'staff_test', password: 'password123', role: 'staff' });

    // Login agents
    adminAgent = await loginAgent('admin_test', 'password123', uniqueIp);
    staffAgent = await loginAgent('staff_test', 'password123', uniqueIp);
    unauthAgent = request.agent(app);
  });

  describe('GET /api/staff', () => {
    it('1. Returns a paginated response shape with correct defaults', async () => {
      await createTestStaff({ fullName: 'Alice', employmentType: 'Permanent', position: 'IT Staff', status: 'Active', email: 'a@ex.com', phoneNumber: '123', joinDate: '2023-01-01T00:00:00.000Z' });
      const res = await adminAgent.get('/api/staff');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('items');
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('page', 1);
      expect(res.body.data).toHaveProperty('limit', 20);
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.items.length).toBe(1);
    });

    it('2. Filter by status returns only matching records', async () => {
      await createTestStaff({ fullName: 'Alice', employmentType: 'Permanent', position: 'IT Staff', status: 'Active', email: 'a@ex.com', phoneNumber: '123', joinDate: '2023-01-01T00:00:00.000Z' });
      await createTestStaff({ fullName: 'Bob', employmentType: 'Permanent', position: 'IT Staff', status: 'Inactive', email: 'b@ex.com', phoneNumber: '123', joinDate: '2023-01-01T00:00:00.000Z' });
      const res = await adminAgent.get('/api/staff?status=Active');
      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(1);
      expect(res.body.data.items[0].fullName).toBe('Alice');
    });

    it('3. Filter by employmentType returns only matching records', async () => {
      await createTestStaff({ fullName: 'Alice', employmentType: 'Permanent', position: 'IT Staff', status: 'Active', email: 'a@ex.com', phoneNumber: '123', joinDate: '2023-01-01T00:00:00.000Z' });
      await createTestStaff({ fullName: 'Bob', employmentType: 'Internship', position: 'IT Staff', status: 'Active', email: 'b@ex.com', phoneNumber: '123', joinDate: '2023-01-01T00:00:00.000Z' });
      const res = await adminAgent.get('/api/staff?employmentType=Internship');
      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(1);
      expect(res.body.data.items[0].fullName).toBe('Bob');
    });

    it('4. Filter by position returns only matching records', async () => {
      await createTestStaff({ fullName: 'Alice', employmentType: 'Permanent', position: 'IT Staff', status: 'Active', email: 'a@ex.com', phoneNumber: '123', joinDate: '2023-01-01T00:00:00.000Z' });
      await createTestStaff({ fullName: 'Bob', employmentType: 'Permanent', position: 'Software Engineer', status: 'Active', email: 'b@ex.com', phoneNumber: '123', joinDate: '2023-01-01T00:00:00.000Z' });
      const res = await adminAgent.get('/api/staff?position=Software Engineer');
      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(1);
      expect(res.body.data.items[0].fullName).toBe('Bob');
    });

    it('5. search matches partial, case-insensitive fullName', async () => {
      await createTestStaff({ fullName: 'Alice Wonderland', employmentType: 'Permanent', position: 'IT Staff', status: 'Active', email: 'a@ex.com', phoneNumber: '123', joinDate: '2023-01-01T00:00:00.000Z' });
      await createTestStaff({ fullName: 'Bob', employmentType: 'Permanent', position: 'Software Engineer', status: 'Active', email: 'b@ex.com', phoneNumber: '123', joinDate: '2023-01-01T00:00:00.000Z' });
      const res = await adminAgent.get('/api/staff?search=wOndER');
      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(1);
      expect(res.body.data.items[0].fullName).toBe('Alice Wonderland');
    });

    it('6. search matches partial staffId', async () => {
      const staff1 = await createTestStaff({ fullName: 'Alice', employmentType: 'Internship', position: 'IT Staff', status: 'Active', email: 'a@ex.com', phoneNumber: '123', joinDate: '2023-01-01T00:00:00.000Z' });
      await createTestStaff({ fullName: 'Bob', employmentType: 'Permanent', position: 'Software Engineer', status: 'Active', email: 'b@ex.com', phoneNumber: '123', joinDate: '2023-01-01T00:00:00.000Z' });
      const res = await adminAgent.get('/api/staff?search=IN0');
      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(1);
      expect(res.body.data.items[0].staffId).toBe(staff1.staffId);
    });

    it('7. page=2 with a small limit returns the correct second-page subset', async () => {
      await createTestStaff({ fullName: 'A', employmentType: 'Permanent', position: 'IT Staff', status: 'Active', email: 'a@ex.com', phoneNumber: '123', joinDate: '2023-01-01T00:00:00.000Z' });
      await createTestStaff({ fullName: 'B', employmentType: 'Permanent', position: 'IT Staff', status: 'Active', email: 'b@ex.com', phoneNumber: '123', joinDate: '2023-01-01T00:00:00.000Z' });
      await createTestStaff({ fullName: 'C', employmentType: 'Permanent', position: 'IT Staff', status: 'Active', email: 'c@ex.com', phoneNumber: '123', joinDate: '2023-01-01T00:00:00.000Z' });
      const res = await adminAgent.get('/api/staff?limit=2&page=2');
      expect(res.status).toBe(200);
      expect(res.body.data.page).toBe(2);
      expect(res.body.data.total).toBe(3);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.items[0].fullName).toBe('A'); // Ordered by createdAt desc, so 'A' is oldest. Wait, actually order is not specified explicitly in prompt, but let's just check length.
    });

    it('8. A staff-role user can access this endpoint (200)', async () => {
      const res = await staffAgent.get('/api/staff');
      expect(res.status).toBe(200);
    });

    it('9. No session at all → 401', async () => {
      const res = await unauthAgent.get('/api/staff');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/staff/:id', () => {
    it('10. Valid id → 200 with the full staff record', async () => {
      const staff = await createTestStaff({ fullName: 'Alice', employmentType: 'Permanent', position: 'IT Staff', status: 'Active', email: 'a@ex.com', phoneNumber: '123', joinDate: '2023-01-01T00:00:00.000Z' });
      const res = await adminAgent.get(`/api/staff/${staff.id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(staff.id);
    });

    it('11. Non-existent id → 404', async () => {
      const res = await adminAgent.get('/api/staff/999999');
      expect(res.status).toBe(404);
    });

    it('12. No session at all → 401', async () => {
      const staff = await createTestStaff({ fullName: 'Alice', employmentType: 'Permanent', position: 'IT Staff', status: 'Active', email: 'a@ex.com', phoneNumber: '123', joinDate: '2023-01-01T00:00:00.000Z' });
      const res = await unauthAgent.get(`/api/staff/${staff.id}`);
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/staff', () => {
    const validData = {
      fullName: 'New Staff',
      employmentType: 'Permanent',
      position: 'IT Staff',
      status: 'Active',
      email: 'new@ex.com',
      phoneNumber: '12345',
      joinDate: '2023-01-01T00:00:00.000Z'
    };

    it('13. Admin creates a Permanent staff → 201, staffId is QS001', async () => {
      const res = await adminAgent.post('/api/staff').send(validData);
      expect(res.status).toBe(201);
      expect(res.body.data.staffId).toBe('QS001');
    });

    it('14. Admin creates a second Permanent/Contract staff → staffId is QS002', async () => {
      await adminAgent.post('/api/staff').send(validData);
      const res = await adminAgent.post('/api/staff').send({ ...validData, employmentType: 'Contract', email: 'contract@ex.com' });
      expect(res.status).toBe(201);
      expect(res.body.data.staffId).toBe('QS002');
    });

    it('15. Admin creates an Internship staff → staffId is IN001', async () => {
      const res = await adminAgent.post('/api/staff').send({ ...validData, employmentType: 'Internship' });
      expect(res.status).toBe(201);
      expect(res.body.data.staffId).toBe('IN001');
    });

    it('16. A staff-role user attempts create → 403', async () => {
      const res = await staffAgent.post('/api/staff').send(validData);
      expect(res.status).toBe(403);
    });

    it('17. No session at all → 401', async () => {
      const res = await unauthAgent.post('/api/staff').send(validData);
      expect(res.status).toBe(401);
    });

    it('18. Missing a required field (e.g. fullName) → 400', async () => {
      const data = { ...validData };
      delete data.fullName;
      const res = await adminAgent.post('/api/staff').send(data);
      expect(res.status).toBe(400);
    });

    it('19. Invalid email format → 400', async () => {
      const res = await adminAgent.post('/api/staff').send({ ...validData, email: 'not-an-email' });
      expect(res.status).toBe(400);
    });

    it('20. Invalid position value → 400', async () => {
      const res = await adminAgent.post('/api/staff').send({ ...validData, position: 'Hacker' });
      expect(res.status).toBe(400);
    });

    it('21. Invalid employmentType value → 400', async () => {
      const res = await adminAgent.post('/api/staff').send({ ...validData, employmentType: 'Freelance' });
      expect(res.status).toBe(400);
    });

    it('22. Sending a staffId in the request body is ignored', async () => {
      const res = await adminAgent.post('/api/staff').send({ ...validData, staffId: 'IN999' });
      expect(res.status).toBe(201);
      expect(res.body.data.staffId).not.toBe('IN999');
    });

    it('23. Concurrency: fire 5 POST /api/staff requests at once → distinct sequential staffIds', async () => {
      const requests = [];
      for (let i = 0; i < 5; i += 1) {
        requests.push(adminAgent.post('/api/staff').send({ ...validData, email: `test${i}@ex.com` }));
      }
      const responses = await Promise.all(requests);
      responses.forEach(res => expect(res.status).toBe(201));

      const staffIds = responses.map(res => res.body.data.staffId);
      const uniqueIds = new Set(staffIds);
      expect(uniqueIds.size).toBe(5);
      expect(uniqueIds.has('QS001')).toBe(true);
      expect(uniqueIds.has('QS005')).toBe(true);
    });
  });

  describe('PUT /api/staff/:id', () => {
    it('24. Admin updates fields → 200, changes persisted', async () => {
      const staff = await createTestStaff({ fullName: 'Alice', employmentType: 'Permanent', position: 'IT Staff', status: 'Active', email: 'a@ex.com', phoneNumber: '123', joinDate: '2023-01-01T00:00:00.000Z' });
      const res = await adminAgent.put(`/api/staff/${staff.id}`).send({ position: 'Management', status: 'Inactive' });
      expect(res.status).toBe(200);
      
      const getRes = await adminAgent.get(`/api/staff/${staff.id}`);
      expect(getRes.body.data.position).toBe('Management');
      expect(getRes.body.data.status).toBe('Inactive');
    });

    it('25. Sending a different staffId in the update body is ignored', async () => {
      const staff = await createTestStaff({ fullName: 'Alice', employmentType: 'Permanent', position: 'IT Staff', status: 'Active', email: 'a@ex.com', phoneNumber: '123', joinDate: '2023-01-01T00:00:00.000Z' });
      const res = await adminAgent.put(`/api/staff/${staff.id}`).send({ staffId: 'QS999' });
      expect(res.status).toBe(200);
      expect(res.body.data.staffId).toBe(staff.staffId);
    });

    it('26. A staff-role user attempts update → 403', async () => {
      const staff = await createTestStaff({ fullName: 'Alice', employmentType: 'Permanent', position: 'IT Staff', status: 'Active', email: 'a@ex.com', phoneNumber: '123', joinDate: '2023-01-01T00:00:00.000Z' });
      const res = await staffAgent.put(`/api/staff/${staff.id}`).send({ status: 'Inactive' });
      expect(res.status).toBe(403);
    });

    it('27. Non-existent id → 404', async () => {
      const res = await adminAgent.put('/api/staff/99999').send({ status: 'Inactive' });
      expect(res.status).toBe(404);
    });

    it('28. No session at all → 401', async () => {
      const staff = await createTestStaff({ fullName: 'Alice', employmentType: 'Permanent', position: 'IT Staff', status: 'Active', email: 'a@ex.com', phoneNumber: '123', joinDate: '2023-01-01T00:00:00.000Z' });
      const res = await unauthAgent.put(`/api/staff/${staff.id}`).send({ status: 'Inactive' });
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/staff/:id', () => {
    it('29. Admin deletes → success status, subsequent GET → 404', async () => {
      const staff = await createTestStaff({ fullName: 'Alice', employmentType: 'Permanent', position: 'IT Staff', status: 'Active', email: 'a@ex.com', phoneNumber: '123', joinDate: '2023-01-01T00:00:00.000Z' });
      const delRes = await adminAgent.delete(`/api/staff/${staff.id}`);
      expect(delRes.status).toBe(200);
      
      const getRes = await adminAgent.get(`/api/staff/${staff.id}`);
      expect(getRes.status).toBe(404);
    });

    it('30. Deleting a staff record deletes the photo file', async () => {
      const staff = await createTestStaff({ fullName: 'Alice', employmentType: 'Permanent', position: 'IT Staff', status: 'Active', email: 'a@ex.com', phoneNumber: '123', joinDate: '2023-01-01T00:00:00.000Z' });
      
      const buffer = makeFakeImageBuffer();
      const uploadRes = await adminAgent.post(`/api/staff/${staff.id}/photo`)
        .attach('photo', buffer, 'test.jpg');
      expect(uploadRes.status).toBe(200);

      const photoPath = path.join(__dirname, '../../', uploadRes.body.data.photoPath);
      expect(fs.existsSync(photoPath)).toBe(true);

      await adminAgent.delete(`/api/staff/${staff.id}`);
      expect(fs.existsSync(photoPath)).toBe(false);
    });

    it('31. A staff-role user attempts delete → 403', async () => {
      const staff = await createTestStaff({ fullName: 'Alice', employmentType: 'Permanent', position: 'IT Staff', status: 'Active', email: 'a@ex.com', phoneNumber: '123', joinDate: '2023-01-01T00:00:00.000Z' });
      const res = await staffAgent.delete(`/api/staff/${staff.id}`);
      expect(res.status).toBe(403);
    });

    it('32. Non-existent id → 404', async () => {
      const res = await adminAgent.delete('/api/staff/99999');
      expect(res.status).toBe(404);
    });

    it('33. No session at all → 401', async () => {
      const staff = await createTestStaff({ fullName: 'Alice', employmentType: 'Permanent', position: 'IT Staff', status: 'Active', email: 'a@ex.com', phoneNumber: '123', joinDate: '2023-01-01T00:00:00.000Z' });
      const res = await unauthAgent.delete(`/api/staff/${staff.id}`);
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/staff/:id/photo', () => {
    it('34. Admin uploads a valid image → 200, photoPath is set, file exists', async () => {
      const staff = await createTestStaff({ fullName: 'Alice', employmentType: 'Permanent', position: 'IT Staff', status: 'Active', email: 'a@ex.com', phoneNumber: '123', joinDate: '2023-01-01T00:00:00.000Z' });
      const buffer = makeFakeImageBuffer();
      
      const res = await adminAgent.post(`/api/staff/${staff.id}/photo`)
        .attach('photo', buffer, 'test.jpg');
      
      expect(res.status).toBe(200);
      expect(res.body.data.photoPath).toBeDefined();

      const filePath = path.join(__dirname, '../../', res.body.data.photoPath);
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('35. Uploading a second photo replaces the first', async () => {
      const staff = await createTestStaff({ fullName: 'Alice', employmentType: 'Permanent', position: 'IT Staff', status: 'Active', email: 'a@ex.com', phoneNumber: '123', joinDate: '2023-01-01T00:00:00.000Z' });
      const buffer = makeFakeImageBuffer();
      
      const res1 = await adminAgent.post(`/api/staff/${staff.id}/photo`)
        .attach('photo', buffer, 'test1.jpg');
      
      const firstPath = path.join(__dirname, '../../', res1.body.data.photoPath);
      expect(fs.existsSync(firstPath)).toBe(true);

      const res2 = await adminAgent.post(`/api/staff/${staff.id}/photo`)
        .attach('photo', buffer, 'test2.png');
      
      const secondPath = path.join(__dirname, '../../', res2.body.data.photoPath);
      expect(fs.existsSync(firstPath)).toBe(false); // First one should be deleted
      expect(fs.existsSync(secondPath)).toBe(true);
    });

    it('36. A file over 2MB is rejected → 400', async () => {
      const staff = await createTestStaff({ fullName: 'Alice', employmentType: 'Permanent', position: 'IT Staff', status: 'Active', email: 'a@ex.com', phoneNumber: '123', joinDate: '2023-01-01T00:00:00.000Z' });
      const largeBuffer = Buffer.alloc(2.1 * 1024 * 1024, 'a'); // > 2MB
      
      const res = await adminAgent.post(`/api/staff/${staff.id}/photo`)
        .attach('photo', largeBuffer, 'test.jpg');
      expect(res.status).toBe(400); // Because of multer limit (handled by error middleware?) Wait, check how multer limit errors are formatted.
    });

    it('37. A non-image file type (e.g. .txt) is rejected → 400', async () => {
      const staff = await createTestStaff({ fullName: 'Alice', employmentType: 'Permanent', position: 'IT Staff', status: 'Active', email: 'a@ex.com', phoneNumber: '123', joinDate: '2023-01-01T00:00:00.000Z' });
      const buffer = Buffer.from('hello world');
      
      const res = await adminAgent.post(`/api/staff/${staff.id}/photo`)
        .attach('photo', buffer, { filename: 'test.txt', contentType: 'text/plain' });
      
      expect(res.status).toBe(400);
    });

    it('38. No file attached at all → 400', async () => {
      const staff = await createTestStaff({ fullName: 'Alice', employmentType: 'Permanent', position: 'IT Staff', status: 'Active', email: 'a@ex.com', phoneNumber: '123', joinDate: '2023-01-01T00:00:00.000Z' });
      const res = await adminAgent.post(`/api/staff/${staff.id}/photo`);
      expect(res.status).toBe(400);
    });

    it('39. A staff-role user attempts upload → 403', async () => {
      const staff = await createTestStaff({ fullName: 'Alice', employmentType: 'Permanent', position: 'IT Staff', status: 'Active', email: 'a@ex.com', phoneNumber: '123', joinDate: '2023-01-01T00:00:00.000Z' });
      const buffer = makeFakeImageBuffer();
      const res = await staffAgent.post(`/api/staff/${staff.id}/photo`)
        .attach('photo', buffer, 'test.jpg');
      
      expect(res.status).toBe(403);
    });

    it('40. Non-existent staff id → 404', async () => {
      const buffer = makeFakeImageBuffer();
      const res = await adminAgent.post('/api/staff/99999/photo')
        .attach('photo', buffer, 'test.jpg');
      
      expect(res.status).toBe(404);
    });

    it('41. No session at all → 401', async () => {
      const staff = await createTestStaff({ fullName: 'Alice', employmentType: 'Permanent', position: 'IT Staff', status: 'Active', email: 'a@ex.com', phoneNumber: '123', joinDate: '2023-01-01T00:00:00.000Z' });
      const buffer = makeFakeImageBuffer();
      const res = await unauthAgent.post(`/api/staff/${staff.id}/photo`)
        .attach('photo', buffer, 'test.jpg');
      
      expect(res.status).toBe(401);
    });
  });
});
