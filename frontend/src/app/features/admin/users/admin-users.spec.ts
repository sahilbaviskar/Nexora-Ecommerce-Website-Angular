import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AdminUsers } from './admin-users';
import { AdminService } from '../../../core/services/admin.service';

const mockUsers = [
  { _id: '1', name: 'Alice', email: 'alice@test.com', role: 'user' },
  { _id: '2', name: 'Bob', email: 'bob@test.com', role: 'admin' },
];

describe('AdminUsers', () => {
  let component: AdminUsers;
  let fixture: ComponentFixture<AdminUsers>;
  let adminMock: any;

  beforeEach(async () => {
    adminMock = {
      getUsers: vi.fn().mockReturnValue(of({ users: mockUsers })),
    };

    await TestBed.configureTestingModule({
      imports: [AdminUsers],
      providers: [{ provide: AdminService, useValue: adminMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminUsers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load users on init', () => {
    expect(component.users.length).toBe(2);
    expect(component.filtered.length).toBe(2);
    expect(component.loading).toBe(false);
  });

  it('should handle error on load', async () => {
    adminMock.getUsers.mockReturnValue(throwError(() => ({ error: { message: 'Error' } })));
    const errorFixture = TestBed.createComponent(AdminUsers);
    errorFixture.detectChanges();
    expect(errorFixture.componentInstance.error).toBe('Error');
    expect(errorFixture.componentInstance.loading).toBe(false);
  });

  it('applyFilter() should filter by name', () => {
    component.search = 'alice';
    component.applyFilter();
    expect(component.filtered.length).toBe(1);
    expect(component.filtered[0].name).toBe('Alice');
  });

  it('applyFilter() should filter by email', () => {
    component.search = 'bob@test';
    component.applyFilter();
    expect(component.filtered.length).toBe(1);
  });

  it('applyFilter() with empty search should show all', () => {
    component.search = '';
    component.applyFilter();
    expect(component.filtered.length).toBe(2);
  });
});
