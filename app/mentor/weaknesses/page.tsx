'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, FileText } from 'lucide-react';

interface Weakness {
  id: string;
  name: string;
  subject: string;
  description?: string;
  learningMaterials: string[];
  createdAt: string;
}

export default function WeaknessManagementPage() {
  const [weaknesses, setWeaknesses] = useState<Weakness[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '국어',
    description: '',
    learningMaterials: '' as any,
  });

  useEffect(() => {
    loadWeaknesses();
  }, []);

  const loadWeaknesses = async () => {
    try {
      setLoading(true);

      // 샘플 데이터
      setWeaknesses([
        {
          id: 'w1',
          name: '비문학 2지문',
          subject: '국어',
          description: '비문학 지문 이해도가 낮은 학생들을 위한 집중 학습',
          learningMaterials: ['비문학_학습지_1.pdf', '비문학_분석법.pdf', '비문학_기출문제.pdf'],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'w2',
          name: '영문법 시제',
          subject: '영어',
          description: '영문법의 복잡한 시제 체계 이해',
          learningMaterials: ['영문법_시제.pdf', '영문법_연습문제.pdf'],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'w3',
          name: '미분 적분',
          subject: '수학',
          description: '미분과 적분의 개념과 활용',
          learningMaterials: ['미분적분_기초.pdf', '미분적분_심화.pdf', '미분적분_예제.pdf'],
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('[v0] 보완점 목록 로드 에러:', error);
      toast.error('보완점 목록을 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (weakness?: Weakness) => {
    if (weakness) {
      setEditingId(weakness.id);
      setFormData({
        name: weakness.name,
        subject: weakness.subject,
        description: weakness.description || '',
        learningMaterials: weakness.learningMaterials,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        subject: '국어',
        description: '',
        learningMaterials: [],
      });
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('보완점 이름을 입력해주세요');
      return;
    }

    try {
      if (editingId) {
        // 수정
        setWeaknesses(
          weaknesses.map((w) =>
            w.id === editingId
              ? { ...w, ...formData, learningMaterials: Array.isArray(formData.learningMaterials) ? formData.learningMaterials : [] }
              : w
          )
        );
        toast.success('보완점이 수정되었습니다');
      } else {
        // 추가
        const newWeakness: Weakness = {
          id: `w${Date.now()}`,
          name: formData.name,
          subject: formData.subject,
          description: formData.description,
          learningMaterials: Array.isArray(formData.learningMaterials) ? formData.learningMaterials : [],
          createdAt: new Date().toISOString(),
        };
        setWeaknesses([...weaknesses, newWeakness]);
        toast.success('보완점이 추가되었습니다');
      }
      setShowDialog(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '저장에 실패했습니다');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      setWeaknesses(weaknesses.filter((w) => w.id !== id));
      toast.success('보완점이 삭제되었습니다');
    } catch (error) {
      toast.error('삭제에 실패했습니다');
    }
  };

  const subjectColors: Record<string, string> = {
    '국어': 'bg-red-100 text-red-700',
    '영어': 'bg-blue-100 text-blue-700',
    '수학': 'bg-green-100 text-green-700',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">보완점 관리</h1>
          <p className="text-gray-600 mt-1">학생들의 약점에 맞춘 학습 자료를 관리합니다</p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          새로운 보완점 추가
        </Button>
      </div>

      {/* 보완점 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {weaknesses.map((weakness) => (
          <Card key={weakness.id} className="p-6 border-2 border-gray-200 hover:border-indigo-300 transition">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{weakness.name}</h2>
                <Badge className={`mt-2 ${subjectColors[weakness.subject] || 'bg-gray-100 text-gray-700'}`}>
                  {weakness.subject}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenDialog(weakness)}
                  className="text-blue-600 border-blue-200"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(weakness.id)}
                  className="text-red-600 border-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {weakness.description && (
              <p className="text-sm text-gray-700 mb-4">{weakness.description}</p>
            )}

            {/* 학습자료 */}
            {weakness.learningMaterials.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <p className="text-sm font-medium text-blue-900">학습자료 ({weakness.learningMaterials.length}개)</p>
                </div>
                <ul className="space-y-1">
                  {weakness.learningMaterials.map((material, idx) => (
                    <li key={idx} className="text-xs text-blue-800 flex items-center gap-2">
                      <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                      {material}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-3">
              생성일: {new Date(weakness.createdAt).toLocaleDateString('ko-KR')}
            </p>
          </Card>
        ))}
      </div>

      {weaknesses.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-gray-600">아직 보완점이 없습니다. 새로운 보완점을 추가해주세요.</p>
        </Card>
      )}

      {/* 보완점 추가/수정 다이얼로그 */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-indigo-700">
              {editingId ? '보완점 수정' : '새로운 보완점 추가'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-gray-700">
                보완점 이름 *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="예: 비문학 2지문"
                className="border-indigo-200"
              />
            </div>

            <div>
              <Label htmlFor="subject" className="text-gray-700">
                과목
              </Label>
              <select
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 border border-indigo-200 rounded-md text-gray-900"
              >
                <option>국어</option>
                <option>영어</option>
                <option>수학</option>
              </select>
            </div>

            <div>
              <Label htmlFor="description" className="text-gray-700">
                설명 (선택)
              </Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="이 보완점에 대한 설명을 입력해주세요"
                className="w-full px-3 py-2 border border-indigo-200 rounded-md text-gray-900"
                rows={3}
              />
            </div>

            <div>
              <Label className="text-gray-700">
                학습자료 (선택)
              </Label>
              <p className="text-xs text-gray-500 mb-2">파일명을 쉼표로 구분하여 입력하세요</p>
              <textarea
                value={Array.isArray(formData.learningMaterials) ? formData.learningMaterials.join(', ') : ''}
                onChange={(e) => setFormData({
                  ...formData,
                  learningMaterials: e.target.value.split(',').map(f => f.trim()).filter(f => f)
                })}
                placeholder="학습자료_1.pdf, 학습자료_2.pdf"
                className="w-full px-3 py-2 border border-indigo-200 rounded-md text-gray-900"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="border-gray-300"
              >
                취소
              </Button>
              <Button
                onClick={handleSave}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {editingId ? '수정' : '추가'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
