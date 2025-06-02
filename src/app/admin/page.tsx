'use client';

import { useState } from 'react';
import { Card, Tabs, Table, Button, Tag, Space, Modal, Form, Input, Select, Switch, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, UserAddOutlined, BankOutlined, SettingOutlined } from '@ant-design/icons';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { MOCK_USERS, MOCK_HOSPITALS, MOCK_BEDS } from '@/constants/mock-data';
import { User, Hospital, Bed } from '@/types';

const { TabPane } = Tabs;

interface FormValues {
  name?: string;
  username?: string;
  email?: string;
  role?: string;
  hospitalId?: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  licenseExpiryDate?: string;
  bedCount?: number;
  roomNumber?: string;
  bedNumber?: string;
  floor?: number;
  patientName?: string;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [hospitals, setHospitals] = useState<Hospital[]>(MOCK_HOSPITALS);
  const [beds, setBeds] = useState<Bed[]>(MOCK_BEDS);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<User | Hospital | Bed | null>(null);
  const [form] = Form.useForm();

  // 사용자 승인/거부
  const handleUserApproval = (userId: string, approved: boolean) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, isActive: approved, approvedAt: approved ? new Date().toISOString() : undefined }
        : user
    ));
    message.success(`사용자가 ${approved ? '승인' : '거부'}되었습니다.`);
  };

  // 병원 활성화/비활성화
  const handleHospitalToggle = (hospitalId: string, isActive: boolean) => {
    setHospitals(hospitals.map(hospital =>
      hospital.id === hospitalId ? { ...hospital, isActive } : hospital
    ));
    message.success(`병원이 ${isActive ? '활성화' : '비활성화'}되었습니다.`);
  };

  // 모달 열기
  const openModal = (type: 'user' | 'hospital' | 'bed', item?: User | Hospital | Bed) => {
    setEditingItem(item || null);
    setModalVisible(true);
    
    if (item) {
      form.setFieldsValue(item);
    } else {
      form.resetFields();
    }
  };

  // 모달 닫기
  const closeModal = () => {
    setModalVisible(false);
    setEditingItem(null);
    form.resetFields();
  };

  // 폼 제출
  const handleSubmit = (values: FormValues) => {
    if (activeTab === 'users') {
      if (editingItem) {
        setUsers(users.map(user => user.id === editingItem.id ? { ...user, ...values } as User : user));
        message.success('사용자 정보가 수정되었습니다.');
      } else {
        const newUser: User = {
          ...values,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          isActive: true,
          role: values.role as User['role'],
          name: values.name || '',
          username: values.username || '',
          email: values.email || '',
        };
        setUsers([...users, newUser]);
        message.success('새 사용자가 추가되었습니다.');
      }
    } else if (activeTab === 'hospitals') {
      if (editingItem) {
        setHospitals(hospitals.map(hospital => hospital.id === editingItem.id ? { ...hospital, ...values } as Hospital : hospital));
        message.success('병원 정보가 수정되었습니다.');
      } else {
        const newHospital: Hospital = {
          ...values,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          isActive: true,
          adminCount: 0,
          nurseCount: 0,
          name: values.name || '',
          address: values.address || '',
          contactPhone: values.contactPhone || '',
          contactEmail: values.contactEmail || '',
          licenseExpiryDate: values.licenseExpiryDate || '',
          bedCount: values.bedCount || 0,
        };
        setHospitals([...hospitals, newHospital]);
        message.success('새 병원이 추가되었습니다.');
      }
    } else if (activeTab === 'beds') {
      if (editingItem) {
        setBeds(beds.map(bed => bed.id === editingItem.id ? { ...bed, ...values } as Bed : bed));
        message.success('침대 정보가 수정되었습니다.');
      } else {
        const newBed: Bed = {
          ...values,
          id: Date.now().toString(),
          isActive: true,
          cctvId: 'cctv-default',
          polygon: [
            { x: 50, y: 50 },
            { x: 150, y: 50 },
            { x: 150, y: 120 },
            { x: 50, y: 120 },
          ],
          roomNumber: values.roomNumber || '',
          bedNumber: values.bedNumber || '',
          floor: values.floor || 1,
          hospitalId: values.hospitalId || '',
          status: 'empty' as const,
        };
        setBeds([...beds, newBed]);
        message.success('새 침대가 추가되었습니다.');
      }
    }
    closeModal();
  };

  // 삭제
  const handleDelete = (type: 'user' | 'hospital' | 'bed', id: string) => {
    Modal.confirm({
      title: '정말 삭제하시겠습니까?',
      content: '삭제된 데이터는 복구할 수 없습니다.',
      onOk: () => {
        if (type === 'user') {
          setUsers(users.filter(user => user.id !== id));
        } else if (type === 'hospital') {
          setHospitals(hospitals.filter(hospital => hospital.id !== id));
        } else if (type === 'bed') {
          setBeds(beds.filter(bed => bed.id !== id));
        }
        message.success('삭제되었습니다.');
      },
    });
  };

  // 사용자 테이블 컬럼
  const userColumns = [
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '사용자명',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '이메일',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '역할',
      dataIndex: 'role',
      key: 'role',
      render: (role: User['role']) => {
        const roleNames = {
          super_admin: '슈퍼 관리자',
          hospital_admin: '병원 관리자',
          nurse: '간호사',
          operator: '관제요원',
        };
        return <Tag color="blue">{roleNames[role]}</Tag>;
      },
    },
    {
      title: '상태',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '승인됨' : '대기중'}
        </Tag>
      ),
    },
    {
      title: '생성일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('ko-KR'),
    },
    {
      title: '액션',
      key: 'action',
      render: (_: unknown, record: User) => (
        <Space>
          {!record.isActive && (
            <>
              <Button
                type="primary"
                size="small"
                onClick={() => handleUserApproval(record.id, true)}
              >
                승인
              </Button>
              <Button
                type="default"
                size="small"
                onClick={() => handleUserApproval(record.id, false)}
              >
                거부
              </Button>
            </>
          )}
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => openModal('user', record)}
          />
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDelete('user', record.id)}
          />
        </Space>
      ),
    },
  ];

  // 병원 테이블 컬럼
  const hospitalColumns = [
    {
      title: '병원명',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '주소',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '연락처',
      dataIndex: 'contactPhone',
      key: 'contactPhone',
    },
    {
      title: '침대 수',
      dataIndex: 'bedCount',
      key: 'bedCount',
    },
    {
      title: '라이선스 만료일',
      dataIndex: 'licenseExpiryDate',
      key: 'licenseExpiryDate',
      render: (date: string) => {
        const expiryDate = new Date(date);
        const today = new Date();
        const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        return (
          <span className={daysLeft < 30 ? 'text-red-500' : daysLeft < 90 ? 'text-orange-500' : 'text-green-500'}>
            {expiryDate.toLocaleDateString('ko-KR')}
            {daysLeft < 30 && ' (곧 만료)'}
          </span>
        );
      },
    },
    {
      title: '상태',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: Hospital) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleHospitalToggle(record.id, checked)}
        />
      ),
    },
    {
      title: '액션',
      key: 'action',
      render: (_: unknown, record: Hospital) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => openModal('hospital', record)}
          />
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDelete('hospital', record.id)}
          />
        </Space>
      ),
    },
  ];

  // 침대 테이블 컬럼
  const bedColumns = [
    {
      title: '병실',
      dataIndex: 'roomNumber',
      key: 'roomNumber',
    },
    {
      title: '침대 번호',
      dataIndex: 'bedNumber',
      key: 'bedNumber',
    },
    {
      title: '층',
      dataIndex: 'floor',
      key: 'floor',
    },
    {
      title: '환자명',
      dataIndex: 'patientName',
      key: 'patientName',
      render: (name: string) => name || '-',
    },
    {
      title: '상태',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '활성' : '비활성'}
        </Tag>
      ),
    },
    {
      title: '액션',
      key: 'action',
      render: (_: unknown, record: Bed) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => openModal('bed', record)}
          />
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDelete('bed', record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <DashboardLayout title="관리자">
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarExtraContent={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal(activeTab as 'user' | 'hospital' | 'bed')}
            >
              {activeTab === 'users' ? '사용자 추가' : 
               activeTab === 'hospitals' ? '병원 추가' : '침대 추가'}
            </Button>
          }
        >
          <TabPane tab={<span><UserAddOutlined />계정 관리</span>} key="users">
            <Table
              dataSource={users}
              columns={userColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab={<span><BankOutlined />병원 관리</span>} key="hospitals">
            <Table
              dataSource={hospitals}
              columns={hospitalColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab={<span><SettingOutlined />침대 관리</span>} key="beds">
            <Table
              dataSource={beds}
              columns={bedColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* 추가/편집 모달 */}
      <Modal
        title={`${editingItem ? '편집' : '추가'} - ${
          activeTab === 'users' ? '사용자' : 
          activeTab === 'hospitals' ? '병원' : '침대'
        }`}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {activeTab === 'users' && (
            <>
              <Form.Item
                label="이름"
                name="name"
                rules={[{ required: true, message: '이름을 입력해주세요' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="사용자명"
                name="username"
                rules={[{ required: true, message: '사용자명을 입력해주세요' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="이메일"
                name="email"
                rules={[{ required: true, type: 'email', message: '올바른 이메일을 입력해주세요' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="역할"
                name="role"
                rules={[{ required: true, message: '역할을 선택해주세요' }]}
              >
                <Select>
                  <Select.Option value="super_admin">슈퍼 관리자</Select.Option>
                  <Select.Option value="hospital_admin">병원 관리자</Select.Option>
                  <Select.Option value="nurse">간호사</Select.Option>
                  <Select.Option value="operator">관제요원</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="병원 ID"
                name="hospitalId"
              >
                <Select allowClear placeholder="병원을 선택해주세요">
                  {hospitals.map(hospital => (
                    <Select.Option key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          )}

          {activeTab === 'hospitals' && (
            <>
              <Form.Item
                label="병원명"
                name="name"
                rules={[{ required: true, message: '병원명을 입력해주세요' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="주소"
                name="address"
                rules={[{ required: true, message: '주소를 입력해주세요' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="연락처"
                name="contactPhone"
                rules={[{ required: true, message: '연락처를 입력해주세요' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="이메일"
                name="contactEmail"
                rules={[{ required: true, type: 'email', message: '올바른 이메일을 입력해주세요' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="라이선스 만료일"
                name="licenseExpiryDate"
                rules={[{ required: true, message: '라이선스 만료일을 입력해주세요' }]}
              >
                <Input type="date" />
              </Form.Item>
              <Form.Item
                label="침대 수"
                name="bedCount"
                rules={[{ required: true, message: '침대 수를 입력해주세요' }]}
              >
                <Input type="number" min={1} />
              </Form.Item>
            </>
          )}

          {activeTab === 'beds' && (
            <>
              <Form.Item
                label="병실 번호"
                name="roomNumber"
                rules={[{ required: true, message: '병실 번호를 입력해주세요' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="침대 번호"
                name="bedNumber"
                rules={[{ required: true, message: '침대 번호를 입력해주세요' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="층"
                name="floor"
                rules={[{ required: true, message: '층을 입력해주세요' }]}
              >
                <Input type="number" min={1} />
              </Form.Item>
              <Form.Item
                label="환자명"
                name="patientName"
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="병원"
                name="hospitalId"
                rules={[{ required: true, message: '병원을 선택해주세요' }]}
              >
                <Select>
                  {hospitals.map(hospital => (
                    <Select.Option key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          )}

          <Form.Item className="mb-0 mt-6">
            <Space className="w-full justify-end">
              <Button onClick={closeModal}>
                취소
              </Button>
              <Button type="primary" htmlType="submit">
                {editingItem ? '수정' : '추가'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </DashboardLayout>
  );
} 