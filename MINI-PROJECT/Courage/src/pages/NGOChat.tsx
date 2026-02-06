import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ngosData from '@/data/ngos.json';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, MessageCircle, Globe, Heart } from 'lucide-react';

interface NGO {
  id: string;
  name: string;
  state: string;
  region: string;
  website?: string;
  whatsapp?: string;
  domains: string[];
  languages: string[];
}

const NGOChat: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const ngos: NGO[] = ngosData;
  const ngo = ngos.find(item => item.id === id);

  const chatUrl = ngo
    ? `http://localhost:5678/webhook/86816cfb-edb3-41c2-a959-b5c72a110eb6/chat?ngo=${encodeURIComponent(ngo.name)}`
    : 'http://localhost:5678/webhook/86816cfb-edb3-41c2-a959-b5c72a110eb6/chat';

  if (!ngo) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate('/?page=ngo')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to NGOs
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>NGO not found</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            The NGO you are looking for does not exist.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <Button variant="ghost" onClick={() => navigate('/?page=ngo')} className="mb-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to NGOs
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Heart className="h-5 w-5" />
            {ngo.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{ngo.region}, {ngo.state}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {ngo.domains.map((domain, idx) => (
              <span
                key={idx}
                className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
              >
                {domain}
              </span>
            ))}
          </div>

          {ngo.website && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <a
                href={`https://${ngo.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-blue-600 break-all"
              >
                {ngo.website}
              </a>
            </div>
          )}

          <div className="pt-2">
            <Button
              onClick={() => window.open(chatUrl, '_blank')}
              className="w-full"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NGOChat;
