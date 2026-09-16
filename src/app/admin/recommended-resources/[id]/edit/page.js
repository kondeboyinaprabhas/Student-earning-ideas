// src/app/admin/recommended-resources/[id]/edit/page.js
'use client';

import { useParams } from 'next/navigation';
import RecommendedResourceBlueprintEditor from '@/components/admin/RecommendedResourceBlueprintEditor';

export default function EditRecommendedResourcePage() {
  const params = useParams();
  const id = params?.id;

  return <RecommendedResourceBlueprintEditor mode="edit" id={id} />;
}
