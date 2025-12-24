import { useState } from 'react';
import { addDomain } from '../../utils/storage';

interface DomainConfigProps {
  onDomainAdded: () => void;
}

export const DomainConfigForm = ({ onDomainAdded }: DomainConfigProps) => {
  const [domain, setDomain] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!domain.trim()) {
      alert('请输入域名');
      return;
    }

    setIsSubmitting(true);

    try {
      await addDomain(domain.trim());
      setDomain('');
      onDomainAdded();
    } catch (error) {
      console.error('添加域名失败:', error);
      alert('添加域名失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="xxl-mb-4">
      <div className="xxl-flex xxl-gap-2">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="例如: devops.zhongbaozhiyun.com"
          className="xxl-flex-1 xxl-px-3 xxl-py-2 xxl-border xxl-border-gray-300 xxl-rounded-md focus:xxl-outline-none focus:xxl-ring-2 focus:xxl-ring-blue-500 xxl-text-sm"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="xxl-px-4 xxl-py-2 xxl-bg-blue-500 xxl-text-white xxl-rounded-md hover:xxl-bg-blue-600 disabled:xxl-opacity-50 disabled:xxl-cursor-not-allowed xxl-text-sm"
        >
          {isSubmitting ? '添加中...' : '添加'}
        </button>
      </div>
      <p className="xxl-text-xs xxl-text-gray-500 xxl-mt-2">
        只需输入域名，无需协议前缀
      </p>
    </form>
  );
};
