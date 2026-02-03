'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { menteeAPI } from '@/lib/api';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Download,
  Upload,
  FileText,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  subject: string;
  goalDescription: string;
  fileUrl?: string;
  fileType: 'pdf' | 'column';
  proofImages?: string[];
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  // 학습자료 추가
  weaknessName?: string;
  learningMaterials?: string[];
}

interface Feedback {
  id: string;
  subject: string;
  summary?: string;
  content: string;
  createdAt: string;
}

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'materials' | 'proof'>('materials');

  useEffect(() => {
    loadAssignmentDetail();
  }, [assignmentId]);

  const loadAssignmentDetail = async () => {
    try {
      setLoading(true);
      setLoading(false);
      
      // 실제 구현에서는 API 호출
      // const data = await menteeAPI.getAssignmentDetail(assignmentId);
      
      // 샘플 데이터
      setAssignment({
        id: assignmentId,
        title: '교과서 10-15쪽 읽기',
        subject: '국어',
        goalDescription: '교과서의 현대 시 섹션을 꼼꼼히 읽고 이해하기',
        fileType: 'column',
        fileUrl: 'https://example.com/material.pdf',
        proofImages: ['https://example.com/proof1.jpg'],
        completed: true,
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        weaknessName: '현대시 분석',
        learningMaterials: ['현대시_표현기법.pdf', '현대시_감상법.pdf', '은유와_비유.pdf'],
      });

      // 샘플 피드백 데이터
      setFeedbacks([
        {
          id: 'fb1',
          subject: '국어',
          summary: '시 감상이 우수합니다',
          content: '현대 시의 표현 기법을 잘 이해하고 있습니다. 특히 은유와 비유의 차이를 명확히 구분하는 모습이 좋습니다. 다음 과제에서는 시적 화자의 감정 변화를 더 세세하게 분석해보세요.',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);
    } catch (error) {
      console.error('[v0] 과제 정보 로드 에러:', error);
      toast.error('과제 정보를 불러올 수 없습니다');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = async () => {
    if (!assignment?.fileUrl) {
      toast.error('다운로드 가능한 파일이 없습니다');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = assignment.fileUrl;
      link.download = `${assignment.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error('파일 다운로드에 실패했습니다');
    }
  };

  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('이미지 파일만 업로드할 수 있습니다');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('파일 크기는 5MB 이하여야 합니다');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadProof = async () => {
    if (!selectedFile) {
      toast.error('파일을 선택해주세요');
      return;
    }

    try {
      setIsUploadingProof(true);
      await menteeAPI.uploadAssignmentProof(assignmentId, selectedFile);
      toast.success('과제 증명 사진이 업로드되었습니다');
      setShowUploadDialog(false);
      setSelectedFile(null);
      loadAssignmentDetail();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '업로드에 실패했습니다');
    } finally {
      setIsUploadingProof(false);
    }
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

  if (!assignment) {
    return (
      <div className="p-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>
        <Card className="p-8 text-center">
          <p className="text-gray-600">과제를 찾을 수 없습니다</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* 헤더 */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>

        <div className="bg-white rounded-lg p-6 border">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
              <div className="flex items-center gap-3">
                <Badge className="bg-indigo-100 text-indigo-700">
                  {assignment.subject}
                </Badge>
                {assignment.completed && (
                  <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    완료
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* 목표 */}
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-2">📌 학습 목표</h3>
            <p className="text-gray-700">{assignment.goalDescription}</p>
          </div>

          {/* 생성 날짜 */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            {new Date(assignment.createdAt).toLocaleDateString('ko-KR')}
          </div>
        </div>
      </div>

      {/* 탭형 UI: 학습자료 / 과제 증명 */}
      <Card className="mb-6">
        {/* 탭 헤더 */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('materials')}
            className={`flex-1 px-4 py-3 font-medium text-center transition ${
              activeTab === 'materials'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            📚 학습자료
          </button>
          <button
            onClick={() => setActiveTab('proof')}
            className={`flex-1 px-4 py-3 font-medium text-center transition ${
              activeTab === 'proof'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            📷 과제 증명
          </button>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="p-6">
          {/* 학습자료 탭 */}
          {activeTab === 'materials' && (
            <div>
              {assignment.weaknessName && (
                <div className="mb-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                  <p className="text-sm font-medium text-yellow-900">
                    ⚠️ 보완점: <span className="font-bold">{assignment.weaknessName}</span>
                  </p>
                </div>
              )}

              {assignment.fileUrl && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">멘토 제공 자료</h3>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-indigo-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {assignment.fileType === 'pdf' ? 'PDF 파일' : '설스터디 칼럼'}
                        </p>
                        <p className="text-xs text-gray-500">멘토가 제공한 자료입니다</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleDownloadFile}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      다운로드
                    </Button>
                  </div>
                </div>
              )}

              {assignment.learningMaterials && assignment.learningMaterials.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">보완 학습자료</h3>
                  <div className="space-y-2">
                    {assignment.learningMaterials.map((material, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <span className="text-sm text-gray-700">{material}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-200"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 멘토 피드백 */}
              {feedbacks.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-gray-900 mb-3">💭 멘토 피드백</h3>
                  <div className="space-y-3">
                    {feedbacks.map((feedback) => (
                      <div key={feedback.id} className="bg-blue-50 p-3 rounded border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-blue-100 text-blue-700 text-xs">{feedback.subject}</Badge>
                          {feedback.summary && (
                            <Badge className="bg-yellow-100 text-yellow-700 text-xs">주요</Badge>
                          )}
                          <span className="text-xs text-gray-500 ml-auto">
                            {new Date(feedback.createdAt).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                        {feedback.summary && (
                          <p className="text-sm font-medium text-blue-600 mb-1">{feedback.summary}</p>
                        )}
                        <p className="text-xs text-gray-700 leading-relaxed">
                          {feedback.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 과제 증명 탭 */}
          {activeTab === 'proof' && (
            <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📷 과제 증명</h2>

        {assignment.proofImages && assignment.proofImages.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">
              제출된 증명 사진 ({assignment.proofImages.length}장)
            </p>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {assignment.proofImages.map((imageUrl, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden border">
                  <img
                    src={imageUrl || "/placeholder.svg"}
                    alt={`증명 사진 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

              <Button
                onClick={() => setShowUploadDialog(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                증명 사진 추가
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* 파일 업로드 다이얼로그 */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>과제 증명 사진 업로드</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleProofFileChange}
                className="hidden"
                id="proof-file-input"
              />
              <label
                htmlFor="proof-file-input"
                className="cursor-pointer block"
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  클릭하여 이미지 선택
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG (최대 5MB)
                </p>
              </label>
              {selectedFile && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ {selectedFile.name}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUploadDialog(false);
                  setSelectedFile(null);
                }}
              >
                취소
              </Button>
              <Button
                onClick={handleUploadProof}
                disabled={isUploadingProof || !selectedFile}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isUploadingProof ? '업로드 중...' : '업로드'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
