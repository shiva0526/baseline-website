
import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";

import { Tournament } from '@/api/tournaments';
import { registerTeam } from '@/api/registrations';

interface TournamentRegistrationFormProps {
  tournament: Tournament;
  onComplete: () => void;
  onCancel: () => void;
}

const TournamentRegistrationForm = ({
  tournament,
  onComplete,
  onCancel
}: TournamentRegistrationFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    'Team Name': '',
    'Captain First Name': '',
    'Captain Last Name': '',
    'Email': '',
    'Phone Number': '',
    'Player 2 Name': '',
    'Player 3 Name': '',
    'Player 4 Name': '',
    'Player 5 Name': '',
    'Substitute 1 Name': '',
    'Substitute 2 Name': '',
    'Substitute 3 Name': '',
    'Any Questions?': ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Define required fields that must be filled
    const essentialFields = ['Team Name', 'Captain First Name', 'Captain Last Name', 'Email', 'Phone Number'];
    
    // Validate essential fields
    const missingEssentialFields = essentialFields.filter(field => 
      !formData[field] || formData[field].trim() === ''
    );
    
    if (missingEssentialFields.length > 0) {
      toast({
        title: "Missing information",
        description: `Please fill in all required fields: ${missingEssentialFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }
    
    // Submit form
    setIsSubmitting(true);
    
    try {
      // Format the data for the API
      const apiFormData = {
        team_name: formData['Team Name'],
        captain_name: `${formData['Captain First Name']} ${formData['Captain Last Name']}`,
        phone: formData['Phone Number'],
        email: formData['Email'],
        player_names: [
          `${formData['Captain First Name']} ${formData['Captain Last Name']}`,
          formData['Player 2 Name'],
          formData['Player 3 Name'],
          formData['Player 4 Name'],
          formData['Player 5 Name'],
          formData['Substitute 1 Name'],
          formData['Substitute 2 Name'],
          formData['Substitute 3 Name']
        ].filter(name => name.trim() !== ''), // Remove empty names
      };
      
      // Call the registration API
      await registerTeam(tournament.id, apiFormData);
      
      onComplete();
      toast({
        title: "Registration successful",
        description: "Your team has been registered for the tournament.",
      });
    } catch (error) {
      console.error('Error saving registration:', error);
      toast({
        title: "Registration failed",
        description: "There was a problem saving your registration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine which form fields to display based on required fields
  const renderFormField = (field: string) => {
    switch (field) {
      case 'Team Name':
        return (
          <div key={field}>
            <label className="block text-sm font-medium mb-1">Team Name *</label>
            <input
              type="text"
              value={formData[field] || ''}
              onChange={e => handleChange(field, e.target.value)}
              className="w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-2"
              placeholder="Enter your team name"
              required
            />
          </div>
        );
      
      case 'Captain First Name':
      case 'Captain Last Name':
        return (
          <div key={field}>
            <label className="block text-sm font-medium mb-1">{field} *</label>
            <input
              type="text"
              value={formData[field] || ''}
              onChange={e => handleChange(field, e.target.value)}
              className="w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-2"
              placeholder={`Enter captain's ${field.toLowerCase().includes('first') ? 'first' : 'last'} name`}
              required
            />
          </div>
        );

      case 'Player 2 Name':
      case 'Player 3 Name':
      case 'Player 4 Name':
      case 'Player 5 Name':
        const playerNum = field.split(' ')[1];
        return (
          <div key={field}>
            <label className="block text-sm font-medium mb-1">{field}</label>
            <input
              type="text"
              value={formData[field] || ''}
              onChange={e => handleChange(field, e.target.value)}
              className="w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-2"
              placeholder={`Enter player ${playerNum} name`}
            />
          </div>
        );

      case 'Substitute 1 Name':
      case 'Substitute 2 Name':
      case 'Substitute 3 Name':
        const subNum = field.split(' ')[1];
        return (
          <div key={field}>
            <label className="block text-sm font-medium mb-1">{field}</label>
            <input
              type="text"
              value={formData[field] || ''}
              onChange={e => handleChange(field, e.target.value)}
              className="w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-2"
              placeholder={`Enter substitute ${subNum} name`}
            />
          </div>
        );

      case 'Email':
        return (
          <div key={field}>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              value={formData[field] || ''}
              onChange={e => handleChange(field, e.target.value)}
              className="w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-2"
              placeholder="Enter contact email"
              required
            />
          </div>
        );

      case 'Phone Number':
        return (
          <div key={field}>
            <label className="block text-sm font-medium mb-1">Phone Number *</label>
            <input
              type="tel"
              value={formData[field] || ''}
              onChange={e => handleChange(field, e.target.value)}
              className="w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-2"
              placeholder="Enter contact phone number"
              required
            />
          </div>
        );

      case 'Team Logo':
        return (
          <div key={field}>
            <label className="block text-sm font-medium mb-1">Team Logo</label>
            <div className="border border-dashed border-gray-700 rounded-md p-4 text-center bg-gray-800/50">
              <p className="text-sm text-gray-400 mb-2">Upload your team logo</p>
              <Button type="button" variant="outline" className="w-full">
                Choose File
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: JPG, PNG, GIF (Max 5MB)
              </p>
            </div>
          </div>
        );

      case 'Any Questions?':
        return (
          <div key={field}>
            <label className="block text-sm font-medium mb-1">Any Questions?</label>
            <textarea
              value={formData[field] || ''}
              onChange={e => handleChange(field, e.target.value)}
              className="w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-2 min-h-[100px]"
              placeholder="Any questions or special requests for your team?"
              rows={4}
            />
          </div>
        );

      default:
        return (
          <div key={field}>
            <label className="block text-sm font-medium mb-1">{field}</label>
            <input
              type="text"
              value={formData[field] || ''}
              onChange={e => handleChange(field, e.target.value)}
              className="w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-2"
              placeholder={`Enter ${field.toLowerCase()}`}
            />
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h2 className="text-xl font-bold">Register for {tournament.title}</h2>
        <button onClick={onCancel} className="rounded-full p-1 hover:bg-gray-800">
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Team Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-baseline-yellow border-b border-gray-700 pb-2">Team Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderFormField('Team Name')}
          </div>
        </div>

        {/* Captain Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-baseline-yellow border-b border-gray-700 pb-2">Captain Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderFormField('Captain First Name')}
            {renderFormField('Captain Last Name')}
          </div>
        </div>

        {/* Players Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-baseline-yellow border-b border-gray-700 pb-2">Players</h3>
          {[2, 3, 4, 5].map(num => (
            <div key={`player-${num}`}>
              {renderFormField(`Player ${num} Name`)}
            </div>
          ))}
        </div>

        {/* Substitutes Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-baseline-yellow border-b border-gray-700 pb-2">Substitutes</h3>
          {[1, 2, 3].map(num => (
            <div key={`substitute-${num}`}>
              {renderFormField(`Substitute ${num} Name`)}
            </div>
          ))}
        </div>

        {/* Contact Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-baseline-yellow border-b border-gray-700 pb-2">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderFormField('Email')}
            {renderFormField('Phone Number')}
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-baseline-yellow border-b border-gray-700 pb-2">Additional Information</h3>
          {renderFormField('Any Questions?')}
        </div>
        
        <div className="pt-4 flex space-x-4">
          <Button
            type="button"
            variant="outline"
            className="w-1/2"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            className="w-1/2 button-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Register'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TournamentRegistrationForm;
