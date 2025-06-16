'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { IoAdd, IoPencil, IoTrash } from 'react-icons/io5';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { MOCK_USERS, MOCK_HOSPITALS, MOCK_BEDS } from '@/constants/mock-data';
import { User, Hospital, Bed } from '@/types';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'hospitals' | 'beds'>('users');
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [hospitals, setHospitals] = useState<Hospital[]>(MOCK_HOSPITALS);
  const [beds, setBeds] = useState<Bed[]>(MOCK_BEDS);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<User | Hospital | Bed | null>(null);

  const formSchema = z.discriminatedUnion('type', [
    z.object({
      type: z.literal('users'),
      id: z.string().optional(),
      name: z.string().min(2, "이름은 2자 이상이어야 합니다."),
      username: z.string().min(4, "사용자명은 4자 이상이어야 합니다."),
      email: z.string().email("유효한 이메일 주소를 입력해주세요."),
      password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다.").optional().or(z.literal('')),
      role: z.enum(['super_admin', 'hospital_admin', 'nurse', 'operator'], { required_error: "역할을 선택해주세요." }),
      hospitalId: z.string().optional(),
    }),
    z.object({
      type: z.literal('hospitals'),
      id: z.string().optional(),
      name: z.string().min(2, "병원 이름은 2자 이상이어야 합니다."),
      address: z.string().min(5, "주소는 5자 이상이어야 합니다."),
      contactPhone: z.string().min(10, "유효한 연락처를 입력해주세요."),
      contactEmail: z.string().email("유효한 이메일을 입력해주세요."),
      bedCount: z.coerce.number().int().positive("침대 수는 1 이상이어야 합니다."),
      licenseExpiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "유효한 날짜를 입력해주세요." }),
    }),
    z.object({
      type: z.literal('beds'),
      id: z.string().optional(),
      hospitalId: z.string({ required_error: "병원을 선택해주세요." }),
      roomNumber: z.string().min(1, "병실을 입력해주세요."),
      bedNumber: z.string().min(1, "침대 번호를 입력해주세요."),
      floor: z.coerce.number().int(),
      patientName: z.string().optional(),
    })
  ]);

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const watchedType = form.watch('type');

  const renderFormFields = () => {
    const type = form.watch('type');
    switch (type) {
      case 'users':
        return (
          <>
            <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>이름</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="username" render={({ field }) => <FormItem><FormLabel>사용자명</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="email" render={({ field }) => <FormItem><FormLabel>이메일</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="password" render={({ field }) => <FormItem><FormLabel>비밀번호</FormLabel><FormControl><Input type="password" {...field} placeholder={editingItem ? '변경 시에만 입력' : ''} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="role" render={({ field }) => (
              <FormItem>
                <FormLabel>역할</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="역할 선택" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="super_admin">최고 관리자</SelectItem>
                    <SelectItem value="hospital_admin">병원 관리자</SelectItem>
                    <SelectItem value="nurse">간호사</SelectItem>
                    <SelectItem value="operator">오퍼레이터</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="hospitalId" render={({ field }) => (
              <FormItem>
                <FormLabel>소속 병원</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value as string | undefined}>
                  <FormControl><SelectTrigger><SelectValue placeholder="병원 선택" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {hospitals.map(h => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </>
        );
      case 'hospitals':
        return (
          <>
            <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>병원명</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="address" render={({ field }) => <FormItem><FormLabel>주소</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="contactPhone" render={({ field }) => <FormItem><FormLabel>연락처</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="contactEmail" render={({ field }) => <FormItem><FormLabel>연락처 이메일</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="bedCount" render={({ field }) => <FormItem><FormLabel>침대 수</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="licenseExpiryDate" render={({ field }) => <FormItem><FormLabel>라이선스 만료일</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>} />
          </>
        );
      case 'beds':
        return (
          <>
            <FormField control={form.control} name="hospitalId" render={({ field }) => (
              <FormItem>
                <FormLabel>소속 병원</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="병원 선택" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {hospitals.map(h => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="roomNumber" render={({ field }) => <FormItem><FormLabel>병실</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="bedNumber" render={({ field }) => <FormItem><FormLabel>침대 번호</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="floor" render={({ field }) => <FormItem><FormLabel>층</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="patientName" render={({ field }) => <FormItem><FormLabel>환자명</FormLabel><FormControl><Input {...field} placeholder="(선택 사항)" /></FormControl><FormMessage /></FormItem>} />
          </>
        );
      default:
        return null;
    }
  };

  // 모달 열기
  const openModal = (type: 'users' | 'hospitals' | 'beds', item?: User | Hospital | Bed) => {
    setEditingItem(item || null);

    switch (type) {
      case 'users':
        form.reset(item ? (item as User) : {
          type: 'users',
          name: '',
          username: '',
          email: '',
          password: '',
          role: 'nurse',
          hospitalId: undefined,
        });
        break;
      case 'hospitals':
        form.reset(
          item
            ? { ...(item as Hospital), licenseExpiryDate: new Date((item as Hospital).licenseExpiryDate).toISOString().split('T')[0] }
            : {
              type: 'hospitals',
              name: '',
              address: '',
              contactPhone: '',
              contactEmail: '',
              bedCount: 0,
              licenseExpiryDate: '',
            }
        );
        break;
      case 'beds':
        form.reset(item ? (item as Bed) : {
          type: 'beds',
          hospitalId: '',
          roomNumber: '',
          bedNumber: '',
          floor: 0,
          patientName: '',
        });
        break;
    }

    setModalVisible(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setModalVisible(false);
    setEditingItem(null);
    form.reset();
  };

  // 폼 제출
  const handleFinish = (values: FormValues) => {
    console.log('Submitted values:', values);
    if (editingItem) {
      toast.success('정보가 수정되었습니다.');
      // TODO: Add actual update logic here based on values.type
    } else {
      toast.success('새 항목이 추가되었습니다.');
      // TODO: Add actual create logic here based on values.type
    }
    closeModal();
  };

  // 사용자 승인/거부
  const handleUserApproval = (userId: string, approved: boolean) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, isActive: approved, approvedAt: approved ? new Date().toISOString() : undefined }
        : user
    ));
    toast.success(`사용자가 ${approved ? '승인' : '거부'}되었습니다.`);
  };

  // 병원 활성화/비활성화
  const handleHospitalToggle = (hospitalId: string, isActive: boolean) => {
    setHospitals(hospitals.map(hospital =>
      hospital.id === hospitalId ? { ...hospital, isActive } : hospital
    ));
    toast.success(`병원이 ${isActive ? '활성화' : '비활성화'}되었습니다.`);
  };

  // 삭제
  const handleDelete = (type: 'users' | 'hospitals' | 'beds', id: string) => {
    if (type === 'users') {
      setUsers(users.filter(user => user.id !== id));
    } else if (type === 'hospitals') {
      setHospitals(hospitals.filter(hospital => hospital.id !== id));
    } else if (type === 'beds') {
      setBeds(beds.filter(bed => bed.id !== id));
    }
    toast.success('삭제되었습니다.');
  };

  return (
    <DashboardLayout title="관리자 페이지">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'users' | 'hospitals' | 'beds')}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="users">사용자</TabsTrigger>
            <TabsTrigger value="hospitals">병원</TabsTrigger>
            <TabsTrigger value="beds">침대</TabsTrigger>
          </TabsList>
          <Button onClick={() => openModal(activeTab)}>
            <IoAdd className="mr-2" />
            {activeTab === 'users' ? '사용자' : activeTab === 'hospitals' ? '병원' : '침대'} 추가
          </Button>
        </div>

        <TabsContent value="users">
          <Card>
            <CardHeader><CardTitle>사용자 목록</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>사용자명</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>역할</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>생성일</TableHead>
                    <TableHead className="text-right">액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const roleNames = { super_admin: '슈퍼 관리자', hospital_admin: '병원 관리자', nurse: '간호사', operator: '관제요원' };
                    return (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell><Badge variant="outline">{roleNames[user.role]}</Badge></TableCell>
                        <TableCell><Badge variant={user.isActive ? 'default' : 'destructive'}>{user.isActive ? '승인됨' : '대기중'}</Badge></TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString('ko-KR')}</TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon">...</Button></DropdownMenuTrigger>
                              <DropdownMenuContent>
                                {!user.isActive && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleUserApproval(user.id, true)}>승인</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleUserApproval(user.id, false)}>거부</DropdownMenuItem>
                                  </> 
                                )}
                                <DropdownMenuItem onClick={() => openModal('users', user)}><IoPencil className="mr-2" /> 수정</DropdownMenuItem>
                                <AlertDialogTrigger asChild><DropdownMenuItem className="text-red-500"><IoTrash className="mr-2" /> 삭제</DropdownMenuItem></AlertDialogTrigger>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle><AlertDialogDescription>삭제된 데이터는 복구할 수 없습니다.</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter><AlertDialogCancel>취소</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete('users', user.id)}>삭제</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hospitals">
          <Card>
            <CardHeader><CardTitle>병원 목록</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>병원명</TableHead>
                    <TableHead>주소</TableHead>
                    <TableHead>연락처</TableHead>
                    <TableHead>침대 수</TableHead>
                    <TableHead>라이선스 만료일</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hospitals.map((hospital) => {
                    const expiryDate = new Date(hospital.licenseExpiryDate);
                    const today = new Date();
                    const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <TableRow key={hospital.id}>
                        <TableCell>{hospital.name}</TableCell>
                        <TableCell>{hospital.address}</TableCell>
                        <TableCell>{hospital.contactPhone}</TableCell>
                        <TableCell>{hospital.bedCount}</TableCell>
                        <TableCell className={daysLeft < 30 ? 'text-red-500' : daysLeft < 90 ? 'text-orange-500' : ''}>
                          {expiryDate.toLocaleDateString('ko-KR')}
                          {daysLeft < 90 && ` (${daysLeft}일 남음)`}
                        </TableCell>
                        <TableCell><Switch checked={hospital.isActive} onCheckedChange={(checked) => handleHospitalToggle(hospital.id, checked)} /></TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon">...</Button></DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => openModal('hospitals', hospital)}><IoPencil className="mr-2" /> 수정</DropdownMenuItem>
                                <AlertDialogTrigger asChild><DropdownMenuItem className="text-red-500"><IoTrash className="mr-2" /> 삭제</DropdownMenuItem></AlertDialogTrigger>
                              </DropdownMenuContent>
                            </DropdownMenu>
                             <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle><AlertDialogDescription>삭제된 데이터는 복구할 수 없습니다.</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter><AlertDialogCancel>취소</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete('hospitals', hospital.id)}>삭제</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="beds">
          <Card>
            <CardHeader><CardTitle>침대 목록</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>병실</TableHead>
                    <TableHead>침대 번호</TableHead>
                    <TableHead>층</TableHead>
                    <TableHead>환자명</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {beds.map((bed) => (
                    <TableRow key={bed.id}>
                      <TableCell>{bed.roomNumber}</TableCell>
                      <TableCell>{bed.bedNumber}</TableCell>
                      <TableCell>{bed.floor}</TableCell>
                      <TableCell>{bed.patientName || '-'}</TableCell>
                      <TableCell><Badge variant={bed.isActive ? 'default' : 'secondary'}>{bed.isActive ? '활성' : '비활성'}</Badge></TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon">...</Button></DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => openModal('beds', bed)}><IoPencil className="mr-2" /> 수정</DropdownMenuItem>
                              <AlertDialogTrigger asChild><DropdownMenuItem className="text-red-500"><IoTrash className="mr-2" /> 삭제</DropdownMenuItem></AlertDialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle><AlertDialogDescription>삭제된 데이터는 복구할 수 없습니다.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>취소</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete('beds', bed.id)}>삭제</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={modalVisible} onOpenChange={setModalVisible}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? `정보 수정` : `새 ${watchedType === 'users' ? '사용자' : watchedType === 'hospitals' ? '병원' : '침대'} 추가`}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFinish)} className="space-y-4 py-4">
              {renderFormFields()}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeModal}>취소</Button>
                <Button type="submit">저장</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}