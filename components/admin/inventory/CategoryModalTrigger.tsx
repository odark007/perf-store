'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import CategoryModal from './CategoryModal';

const CategoryModalTrigger = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus size={18} />}>
        Add Category
      </Button>
      <CategoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default CategoryModalTrigger;