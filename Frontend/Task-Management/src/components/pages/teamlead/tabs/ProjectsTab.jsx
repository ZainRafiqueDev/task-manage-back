import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";

// Manual UI Components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`p-6 pb-4 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const Button = ({ 
  children, 
  onClick, 
  variant = "default", 
  size = "default", 
  disabled = false,
  className = "",
  type = "button"
}) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
    ghost: "text-gray-700 hover:bg-gray-100"
  };
  
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-8 px-3 text-sm",
    lg: "h-12 px-8"
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  className = "",
  disabled = false
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    disabled={disabled}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
);

const Tabs = ({ children, defaultValue, value, onValueChange, className = "" }) => {
  const [activeTab, setActiveTab] = useState(defaultValue || value);
  
  const handleTabChange = (newValue) => {
    setActiveTab(newValue);
    if (onValueChange) onValueChange(newValue);
  };
  
  return (
    <div className={className}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { activeTab, onTabChange: handleTabChange })
      )}
    </div>
  );
};

const TabsList = ({ children, activeTab, onTabChange, className = "" }) => (
  <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 ${className}`}>
    {React.Children.map(children, child =>
      React.cloneElement(child, { activeTab, onTabChange })
    )}
  </div>
);

const TabsTrigger = ({ children, value, activeTab, onTabChange, className = "" }) => {
  const isActive = activeTab === value;
  return (
    <button
      onClick={() => onTabChange(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        isActive 
          ? "bg-white text-gray-900 shadow-sm" 
          : "text-gray-600 hover:text-gray-900"
      } ${className}`}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ children, value, activeTab, className = "" }) => {
  if (activeTab !== value) return null;
  return (
    <div className={`mt-4 ${className}`}>
      {children}
    </div>
  );
};

const Select = ({ children, value, onValueChange, placeholder, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  
  const handleSelect = (newValue) => {
    setSelectedValue(newValue);
    if (onValueChange) onValueChange(newValue);
    setIsOpen(false);
  };
  
  return (
    <div className={`relative ${className}`}>
      {React.Children.map(children, child => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, { 
            isOpen, 
            setIsOpen, 
            selectedValue, 
            placeholder 
          });
        }
        if (child.type === SelectContent) {
          return React.cloneElement(child, { 
            isOpen, 
            selectedValue, 
            onSelect: handleSelect 
          });
        }
        return child;
      })}
    </div>
  );
};

const SelectTrigger = ({ children, isOpen, setIsOpen, selectedValue, placeholder, className = "" }) => (
  <button
    onClick={() => setIsOpen(!isOpen)}
    className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
  >
    <span className={selectedValue ? "text-gray-900" : "text-gray-500"}>
      {children || placeholder}
    </span>
    <svg
      className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </button>
);

const SelectValue = ({ placeholder }) => <span>{placeholder}</span>;

const SelectContent = ({ children, isOpen, selectedValue, onSelect, className = "" }) => {
  if (!isOpen) return null;
  
  return (
    <div className={`absolute top-full left-0 z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto ${className}`}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { selectedValue, onSelect })
      )}
    </div>
  );
};

const SelectItem = ({ children, value, selectedValue, onSelect, className = "" }) => (
  <div
    onClick={() => onSelect(value)}
    className={`cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 ${
      selectedValue === value ? "bg-blue-50 text-blue-900" : "text-gray-900"
    } ${className}`}
  >
    {children}
  </div>
);

// Import your API functions
/*
import {
  createProject,
  getAllProjects,
  deleteProject,
  updateProject,
  getProjectById,
  // Project Details
  addProjectDetails,
  getProjectDetails,
  updateProjectDetails,
  deleteProjectDetails,
  // Payments
  addPayment,
  updatePayment,
  deletePayment,
  // Time Entries
  addTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  // Milestones
  addMilestone,
  updateMilestone,
  deleteMilestone,
  // Client Status
  updateClientStatus,
  // Team Management
  assignTeamLead,
  assignEmployees,
  // Project Groups
  createProjectGroup,
  getProjectGroups,
  updateProjectGroup,
  deleteProjectGroup,
} from './ProjectApi';
*/

// Mock API functions for demo (replace with your actual imports)
const mockApi = {
  getAllProjects: async () => [
    { _id: '1', name: 'Project Alpha', client: 'Client A' },
    { _id: '2', name: 'Project Beta', client: 'Client B' }
  ],
  createProject: async (data) => ({ _id: Date.now().toString(), ...data }),
  deleteProject: async (id) => id,
  addPayment: async (projectId, data) => ({ _id: Date.now().toString(), ...data }),
  deletePayment: async (projectId, paymentId) => paymentId,
  addMilestone: async (projectId, data) => ({ _id: Date.now().toString(), ...data }),
  deleteMilestone: async (projectId, milestoneId) => milestoneId,
  addTimeEntry: async (projectId, data) => ({ _id: Date.now().toString(), ...data }),
  deleteTimeEntry: async (projectId, entryId) => entryId,
  addProjectDetails: async (projectId, data) => ({ _id: Date.now().toString(), ...data }),
  deleteProjectDetails: async (projectId, detailId) => detailId,
  createProjectGroup: async (data) => ({ _id: Date.now().toString(), ...data }),
  getProjectGroups: async () => [],
  deleteProjectGroup: async (id) => id,
  assignTeamLead: async (projectId, teamLeadId) => ({ success: true }),
  assignEmployees: async (projectId, employeeIds) => ({ success: true }),
  updateClientStatus: async (projectId, status) => ({ success: true })
};

const ProjectsTab = () => {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({ name: "", client: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await mockApi.getAllProjects(); // Replace with: getAllProjects()
      setProjects(data);
    } catch (err) {
      setError("Failed to load projects");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async () => {
    if (!newProject.name || !newProject.client) {
      setError("Please fill in all fields");
      return;
    }
    
    try {
      setError("");
      const project = await mockApi.createProject(newProject); // Replace with: createProject(newProject)
      setProjects([...projects, project]);
      setNewProject({ name: "", client: "" });
    } catch (err) {
      setError("Failed to add project");
      console.error(err);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    
    try {
      await mockApi.deleteProject(id); // Replace with: deleteProject(id)
      setProjects(projects.filter((p) => p._id !== id));
    } catch (err) {
      setError("Failed to delete project");
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Projects Management</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <Tabs defaultValue="list">
            <div className="overflow-x-auto">
              <TabsList className="flex flex-wrap gap-1 w-full justify-start">
                <TabsTrigger value="list">Projects</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="milestones">Milestones</TabsTrigger>
                <TabsTrigger value="time">Time</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="groups">Groups</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="status">Status</TabsTrigger>
              </TabsList>
            </div>

            {/* Projects Section */}
            <TabsContent value="list">
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <Input
                  placeholder="Project Name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                />
                <Input
                  placeholder="Client"
                  value={newProject.client}
                  onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
                />
                <Button onClick={handleAddProject} disabled={loading}>
                  <Plus size={16} className="mr-2" /> Add
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {projects.map((project) => (
                    <div key={project._id} className="flex justify-between items-center border p-3 rounded-lg hover:bg-gray-50">
                      <div>
                        <span className="font-medium">{project.name}</span>
                        <span className="text-gray-500 ml-2">({project.client})</span>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteProject(project._id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                  {projects.length === 0 && (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                      <Plus size={32} className="mx-auto mb-2 text-gray-400" />
                      <p>No projects found. Add your first project above.</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="payments">
              <PaymentsSection projects={projects} />
            </TabsContent>

            <TabsContent value="milestones">
              <MilestonesSection projects={projects} />
            </TabsContent>

            <TabsContent value="time">
              <TimeSection projects={projects} />
            </TabsContent>

            <TabsContent value="details">
              <DetailsSection projects={projects} />
            </TabsContent>

            <TabsContent value="groups">
              <GroupsSection />
            </TabsContent>

            <TabsContent value="team">
              <TeamSection projects={projects} />
            </TabsContent>

            <TabsContent value="status">
              <StatusSection projects={projects} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

/* ----------------- Subsections ----------------- */

const PaymentsSection = ({ projects }) => {
  const [selectedProject, setSelectedProject] = useState("");
  const [payments, setPayments] = useState([]);
  const [newPayment, setNewPayment] = useState({ amount: "", description: "", date: "" });

  const handleAddPayment = async () => {
    if (!selectedProject || !newPayment.amount) return;
    
    try {
      const payment = await mockApi.addPayment(selectedProject, newPayment); // Replace with: addPayment
      setPayments([...payments, payment]);
      setNewPayment({ amount: "", description: "", date: "" });
    } catch (err) {
      console.error("Failed to add payment:", err);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    try {
      await mockApi.deletePayment(selectedProject, paymentId); // Replace with: deletePayment
      setPayments(payments.filter(p => p._id !== paymentId));
    } catch (err) {
      console.error("Failed to delete payment:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map(project => (
              <SelectItem key={project._id} value={project._id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProject && (
        <>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="number"
              placeholder="Amount"
              value={newPayment.amount}
              onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
            />
            <Input
              placeholder="Description"
              value={newPayment.description}
              onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })}
            />
            <Input
              type="date"
              value={newPayment.date}
              onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })}
            />
            <Button onClick={handleAddPayment}>
              <Plus size={16} className="mr-2" /> Add Payment
            </Button>
          </div>

          <div className="space-y-2">
            {payments.map(payment => (
              <div key={payment._id} className="flex justify-between items-center border p-3 rounded-lg">
                <div>
                  <span className="font-medium">${payment.amount}</span>
                  <span className="text-gray-500 ml-2">{payment.description}</span>
                  <span className="text-sm text-gray-400 ml-2">{payment.date}</span>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleDeletePayment(payment._id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            {payments.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No payments added yet.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const MilestonesSection = ({ projects }) => {
  const [selectedProject, setSelectedProject] = useState("");
  const [milestones, setMilestones] = useState([]);
  const [newMilestone, setNewMilestone] = useState({ title: "", description: "", dueDate: "" });

  const handleAddMilestone = async () => {
    if (!selectedProject || !newMilestone.title) return;
    
    try {
      const milestone = await mockApi.addMilestone(selectedProject, newMilestone); // Replace with: addMilestone
      setMilestones([...milestones, milestone]);
      setNewMilestone({ title: "", description: "", dueDate: "" });
    } catch (err) {
      console.error("Failed to add milestone:", err);
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    try {
      await mockApi.deleteMilestone(selectedProject, milestoneId); // Replace with: deleteMilestone
      setMilestones(milestones.filter(m => m._id !== milestoneId));
    } catch (err) {
      console.error("Failed to delete milestone:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map(project => (
              <SelectItem key={project._id} value={project._id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProject && (
        <>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Milestone Title"
              value={newMilestone.title}
              onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
            />
            <Input
              placeholder="Description"
              value={newMilestone.description}
              onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
            />
            <Input
              type="date"
              value={newMilestone.dueDate}
              onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
            />
            <Button onClick={handleAddMilestone}>
              <Plus size={16} className="mr-2" /> Add Milestone
            </Button>
          </div>

          <div className="space-y-2">
            {milestones.map(milestone => (
              <div key={milestone._id} className="flex justify-between items-center border p-3 rounded-lg">
                <div>
                  <span className="font-medium">{milestone.title}</span>
                  <span className="text-gray-500 ml-2">{milestone.description}</span>
                  <span className="text-sm text-gray-400 ml-2">{milestone.dueDate}</span>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleDeleteMilestone(milestone._id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const TimeSection = ({ projects }) => {
  const [selectedProject, setSelectedProject] = useState("");
  const [timeEntries, setTimeEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({ hours: "", description: "", date: "" });

  const handleAddTimeEntry = async () => {
    if (!selectedProject || !newEntry.hours) return;
    
    try {
      const entry = await mockApi.addTimeEntry(selectedProject, newEntry); // Replace with: addTimeEntry
      setTimeEntries([...timeEntries, entry]);
      setNewEntry({ hours: "", description: "", date: "" });
    } catch (err) {
      console.error("Failed to add time entry:", err);
    }
  };

  const handleDeleteTimeEntry = async (entryId) => {
    try {
      await mockApi.deleteTimeEntry(selectedProject, entryId); // Replace with: deleteTimeEntry
      setTimeEntries(timeEntries.filter(e => e._id !== entryId));
    } catch (err) {
      console.error("Failed to delete time entry:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map(project => (
              <SelectItem key={project._id} value={project._id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProject && (
        <>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="number"
              placeholder="Hours"
              value={newEntry.hours}
              onChange={(e) => setNewEntry({ ...newEntry, hours: e.target.value })}
            />
            <Input
              placeholder="Description"
              value={newEntry.description}
              onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
            />
            <Input
              type="date"
              value={newEntry.date}
              onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
            />
            <Button onClick={handleAddTimeEntry}>
              <Plus size={16} className="mr-2" /> Add Entry
            </Button>
          </div>

          <div className="space-y-2">
            {timeEntries.map(entry => (
              <div key={entry._id} className="flex justify-between items-center border p-3 rounded-lg">
                <div>
                  <span className="font-medium">{entry.hours}h</span>
                  <span className="text-gray-500 ml-2">{entry.description}</span>
                  <span className="text-sm text-gray-400 ml-2">{entry.date}</span>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleDeleteTimeEntry(entry._id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const DetailsSection = ({ projects }) => {
  const [selectedProject, setSelectedProject] = useState("");
  const [details, setDetails] = useState([]);
  const [newDetail, setNewDetail] = useState({ key: "", value: "" });

  const handleAddDetail = async () => {
    if (!selectedProject || !newDetail.key || !newDetail.value) return;
    
    try {
      const detail = await mockApi.addProjectDetails(selectedProject, newDetail); // Replace with: addProjectDetails
      setDetails([...details, detail]);
      setNewDetail({ key: "", value: "" });
    } catch (err) {
      console.error("Failed to add detail:", err);
    }
  };

  const handleDeleteDetail = async (detailId) => {
    try {
      await mockApi.deleteProjectDetails(selectedProject, detailId); // Replace with: deleteProjectDetails
      setDetails(details.filter(d => d._id !== detailId));
    } catch (err) {
      console.error("Failed to delete detail:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map(project => (
              <SelectItem key={project._id} value={project._id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProject && (
        <>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Detail Key"
              value={newDetail.key}
              onChange={(e) => setNewDetail({ ...newDetail, key: e.target.value })}
            />
            <Input
              placeholder="Detail Value"
              value={newDetail.value}
              onChange={(e) => setNewDetail({ ...newDetail, value: e.target.value })}
            />
            <Button onClick={handleAddDetail}>
              <Plus size={16} className="mr-2" /> Add Detail
            </Button>
          </div>

          <div className="space-y-2">
            {details.map(detail => (
              <div key={detail._id} className="flex justify-between items-center border p-3 rounded-lg">
                <div>
                  <span className="font-medium">{detail.key}:</span>
                  <span className="text-gray-700 ml-2">{detail.value}</span>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleDeleteDetail(detail._id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const GroupsSection = () => {
  const [groups, setGroups] = useState([]);
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await mockApi.getProjectGroups(); // Replace with: getProjectGroups
      setGroups(data);
    } catch (err) {
      console.error("Failed to load groups:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGroup = async () => {
    if (!newGroup.name) return;
    
    try {
      const group = await mockApi.createProjectGroup(newGroup); // Replace with: createProjectGroup
      setGroups([...groups, group]);
      setNewGroup({ name: "", description: "" });
    } catch (err) {
      console.error("Failed to add group:", err);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await mockApi.deleteProjectGroup(groupId); // Replace with: deleteProjectGroup
      setGroups(groups.filter(g => g._id !== groupId));
    } catch (err) {
      console.error("Failed to delete group:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Group Name"
          value={newGroup.name}
          onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
        />
        <Input
          placeholder="Description"
          value={newGroup.description}
          onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
        />
        <Button onClick={handleAddGroup}>
          <Plus size={16} className="mr-2" /> Add Group
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map(group => (
            <div key={group._id} className="flex justify-between items-center border p-3 rounded-lg">
              <div>
                <span className="font-medium">{group.name}</span>
                <span className="text-gray-500 ml-2">{group.description}</span>
              </div>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => handleDeleteGroup(group._id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
          {groups.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No groups found. Add your first group above.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TeamSection = ({ projects }) => {
  const [selectedProject, setSelectedProject] = useState("");
  const [teamLeadId, setTeamLeadId] = useState("");
  const [employeeIds, setEmployeeIds] = useState("");

  const handleAssignTeamLead = async () => {
    if (!selectedProject || !teamLeadId) return;
    
    try {
      await mockApi.assignTeamLead(selectedProject, teamLeadId); // Replace with: assignTeamLead
      alert("Team lead assigned successfully!");
      setTeamLeadId("");
    } catch (err) {
      console.error("Failed to assign team lead:", err);
    }
  };

  const handleAssignEmployees = async () => {
    if (!selectedProject || !employeeIds) return;
    
    try {
      const employeeArray = employeeIds.split(",").map(id => id.trim());
      await mockApi.assignEmployees(selectedProject, employeeArray); // Replace with: assignEmployees
      alert("Employees assigned successfully!");
      setEmployeeIds("");
    } catch (err) {
      console.error("Failed to assign employees:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map(project => (
              <SelectItem key={project._id} value={project._id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProject && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Team Lead ID"
              value={teamLeadId}
              onChange={(e) => setTeamLeadId(e.target.value)}
            />
            <Button onClick={handleAssignTeamLead}>
              Assign Team Lead
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Employee IDs (comma separated)"
              value={employeeIds}
              onChange={(e) => setEmployeeIds(e.target.value)}
            />
            <Button onClick={handleAssignEmployees}>
              Assign Employees
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusSection = ({ projects }) => {
  const [selectedProject, setSelectedProject] = useState("");
  const [status, setStatus] = useState("");

  const handleUpdateStatus = async () => {
    if (!selectedProject || !status) return;
    
    try {
      await mockApi.updateClientStatus(selectedProject, status); // Replace with: updateClientStatus
      alert("Client status updated successfully!");
      setStatus("");
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map(project => (
              <SelectItem key={project._id} value={project._id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProject && (
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleUpdateStatus}>
            Update Status
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProjectsTab;