import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, BlockStack, Banner, Text, Page, RadioButton, Select} from '@shopify/polaris';

function AppIndex() {
  // Get the current time and format it as HH:MM
  const currentTime = new Date();
  const formattedTime = currentTime.getHours().toString().padStart(2, '0') + ':' + currentTime.getMinutes().toString().padStart(2, '0');
  
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [time, setTime] = useState(formattedTime);
  const [timeSlots, setTimeSlots] = useState([]);
  const [error, setError] = useState(null);
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);
  
  const [interval, setInterval] = useState('30min');
  const intervalOptions = [
    {label: '30分钟', value: '30min'},
    {label: '1小时', value: '1hr'}
  ];
  

  useEffect(() => {
    fetch('/api/getTimeSlots')
      .then(response => response.json())
      .then(data => setTimeSlots(data))
      .catch(err => setError(err.message));
  }, []);

  const handleDeleteTimeSlot = async (timeSlotId) => {
    const response = await fetch(`/api/deleteTimeSlot/${timeSlotId}`, { method: 'DELETE' });

    if (response.ok) {
      // Remove the deleted time slot from state, triggering a UI update
      setTimeSlots(timeSlots.filter(slot => slot.id !== timeSlotId));
    } else {
      // Handle errors (e.g., show an error message)
      console.error('Failed to delete the time slot');
    }
  };
  const toggleManageMode = () => {
    setIsManageMode(!isManageMode);
  };

  const handleTimeChange = (event) => {
    setTime(event.target.value);
  };

  const toggleTimePickerModal = () => {
    setShowTimePicker(!showTimePicker);
  };

  const saveTimeSlot = async (newTime) => {
    // Optimistically update the state with the new time slot
    setTimeSlots(prevTimeSlots => [...prevTimeSlots, { time: newTime }]);
  
    try {
      const response = await fetch('/api/saveTimeSlot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time: newTime })
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      // If the network request is successful, no need to update the state again
      const savedTimeSlot = await response.json();
    } catch (error) {
      console.error('Failed to save time slot:', error);
      setError(error.message);
  
      // If the request fails, revert the optimistic update
      setTimeSlots(prevTimeSlots => prevTimeSlots.filter(slot => slot.time !== newTime));
    }
  };
  
  const generateAndSaveTimeSlots = () => {
    let generatedSlots = [];
    const currentTime = new Date();
    const formattedTime = currentTime.getHours().toString().padStart(2, '0') + ':' + currentTime.getMinutes().toString().padStart(2, '0');
    let baseTime = new Date(currentTime.toDateString() + ' ' + formattedTime);
    let intervalMinutes = interval === '30min' ? 30 : 60; // Interval based on state
  
    for (let i = 0; i < 5; i++) {
      let newTime = new Date(baseTime.getTime() + i * intervalMinutes * 60000);
      console.log(newTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })); // Log each new time

      generatedSlots.push(newTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    }
    console.log(generatedSlots);
  
    Promise.all(generatedSlots.map(slot => saveTimeSlot(slot)))
      .then(newSlots => {
        setTimeSlots([...timeSlots, ...newSlots.map(slot => slot.time)]);
        setShowTimePicker(false);
      })
      .catch(err => {
        console.error('Error saving time slots:', err);
        // Handle errors
      });
  };
  
  
  const onPrimaryActionClick = () => {
    if (autoGenerate) {
      generateAndSaveTimeSlots();
    } else {
      saveTimeSlot(time).then(savedSlot => {
        setTimeSlots([...timeSlots, savedSlot.time]);
        setShowTimePicker(false);
      });
    }
  };

  return (
    <Page fullWidth>
      <div style={{ margin: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        
          <BlockStack gap="500">
            <Card height='300px'>
              <h2 style={{ fontWeight: 'bold', fontSize: '22px'}}>已创建的送货时间: </h2>
            </Card>

          </BlockStack>
    
          {timeSlots.map((timeSlot, index) => (
           <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' ,marginRight:'30px'}}>
           <Card key={index} sectioned style={{ width: '500px' }}>
             <BlockStack>
               {/* Bold and larger text for the time slot */}
               <p style={{ fontWeight: 'bold', fontSize: '18px' }}>{timeSlot.time}</p>
               
               {/* DropZone-like UI without actual DropZone functionality */}
               <div style={{
                 width: '500px', 
                 height: '114px', 
                 border: '2px dashed #ccc', 
                 display: 'flex', 
                 alignItems: 'center', 
                 justifyContent: 'center',
                 borderRadius: '4px',
                 marginTop: '10px'
               }}>
                 {/* Drop zone content */}
               </div>
             </BlockStack>
           </Card>
         
           {isManageMode && (
             <Button variant='primary' tone='critical' onClick={() => handleDeleteTimeSlot(timeSlot.id)}  style={{ marginLeft: '30px' }}>
               删除
             </Button>
           )}
         </div>

          ))}


        <div style={{ marginTop: '20px' }}>
          <Button onClick={toggleTimePickerModal}>+ 创建</Button>
          <Button variant="primary" tone="critical" onClick={toggleManageMode}>
            {isManageMode ? '退出管理' : '管理'}
          </Button>

        </div>

        {showTimePicker && (
        <Modal
          open={showTimePicker}
          onClose={toggleTimePickerModal}
          title="创建新的送货时间"
          primaryAction={{
            content: '确认创建',
            onAction: onPrimaryActionClick,
          }}
        >
          <Modal.Section>
        
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <RadioButton
                label="手动创建时间"
                checked={!autoGenerate}
                onChange={() => setAutoGenerate(false)}
              />
              <RadioButton
                label="自动生成五个时间段"
                checked={autoGenerate}
                onChange={() => setAutoGenerate(true)}
              />
              {autoGenerate && (
                <Select
                  label="选择间隔"
                  options={intervalOptions}
                  onChange={setInterval}
                  value={interval}
                />
              )}
              {!autoGenerate && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <input type="time" value={time} onChange={handleTimeChange} />
                </div>
              )}
            </div>
          </div>
          
          </Modal.Section>
        </Modal>
      )}
      </div>
    </Page>
  );
}

export default AppIndex;
