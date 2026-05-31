import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProfileService, AddressPayload } from './profile.service';

describe('ProfileService', () => {
  let service: ProfileService;
  let httpMock: HttpTestingController;
  const api = 'http://localhost:3000/api/profile';

  const mockAddress: AddressPayload = {
    type: 'home', fullName: 'Jane', phone: '9999999999',
    addressLine1: '5 Main St', addressLine2: '', city: 'Pune',
    state: 'MH', postalCode: '411001', country: 'India', isDefault: false,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => expect(service).toBeTruthy());

  it('getProfile() should GET /profile and extract user', () => {
    let result: any;
    service.getProfile().subscribe((u) => (result = u));
    httpMock.expectOne(api).flush({ user: { name: 'Jane' } });
    expect(result.name).toBe('Jane');
  });

  it('updateProfile() should PUT /profile and extract user', () => {
    let result: any;
    service.updateProfile({ name: 'Updated' }).subscribe((u) => (result = u));
    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('PUT');
    req.flush({ user: { name: 'Updated' } });
    expect(result.name).toBe('Updated');
  });

  it('getAddresses() should GET /profile/addresses and extract array', () => {
    let result: any[];
    service.getAddresses().subscribe((a) => (result = a));
    httpMock.expectOne(`${api}/addresses`).flush({ addresses: [mockAddress] });
    expect(result!.length).toBe(1);
  });

  it('getAddresses() should return empty array when missing', () => {
    let result: any[];
    service.getAddresses().subscribe((a) => (result = a));
    httpMock.expectOne(`${api}/addresses`).flush({});
    expect(result!).toEqual([]);
  });

  it('addAddress() should POST /profile/addresses', () => {
    service.addAddress(mockAddress).subscribe();
    const req = httpMock.expectOne(`${api}/addresses`);
    expect(req.request.method).toBe('POST');
    req.flush({ address: mockAddress });
  });

  it('updateAddress() should PUT /profile/addresses/:id', () => {
    service.updateAddress('addr1', mockAddress).subscribe();
    const req = httpMock.expectOne(`${api}/addresses/addr1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ address: mockAddress });
  });

  it('deleteAddress() should DELETE /profile/addresses/:id', () => {
    service.deleteAddress('addr1').subscribe();
    const req = httpMock.expectOne(`${api}/addresses/addr1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
