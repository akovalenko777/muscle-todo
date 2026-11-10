import { DialogContent, Drawer, Tooltip, Typography, SwipeableDrawer } from "@mui/material";
import { useQuickTasksStore } from "../../store/quickTasksStore";
import CustomDialogTitle from "../parts/CustomDialogTitle";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import api from "../../api/axios";
import type { AxiosResponse } from "axios";
import { toast } from "react-toastify";
import QuickTaskRow from "./QuickTaskRow";
import QuickTasksForm from "./QuickTasksForm";
import HelpIcon from '@mui/icons-material/Help';

export default function QuickTasksPanel() {
  const { t } = useTranslation()
  const { quickTasks, showQuickTasks, toggleQuickTasks, setQuickTasks, addQuickTask, deleteQuickTask, setDoneQuickTask } = useQuickTasksStore()

  useEffect(() => {
    const fetchQuickTasks = async () => {
      try {
        const response: AxiosResponse = await api.get('/quick_tasks')
        if (response.status === 200) {
          setQuickTasks(response.data)
        }
      } catch {
        toast.error(t('quickTasks.messages.getListError'))
      }
    }
    fetchQuickTasks()
  }, [setQuickTasks, t]);

  return (
    <SwipeableDrawer
      anchor="right"
      open={showQuickTasks}
      sx={{ zIndex: 1300 }}
      onOpen={() => toggleQuickTasks(true)}
      onClose={() => toggleQuickTasks(false)}
      swipeAreaWidth={30}
      disableBackdropTransition={true}
      disableDiscovery={true}
      disableSwipeToOpen={false}
      slotProps={{
        paper: {
          sx: { width: 'min(50%, 600px)', p: 0 }
        }
      }}
    >
      <CustomDialogTitle title={t('quickTasks.title')} />
      <DialogContent>
        <QuickTasksForm onSuccess={addQuickTask} />
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {t('quickTasks.listTitle')}
          <Tooltip title={t('quickTasks.messages.helpText')}>
            <HelpIcon />
          </Tooltip>
        </Typography>
        {quickTasks.map((task) => <QuickTaskRow key={task.id} task={task} onDone={setDoneQuickTask} onDelete={deleteQuickTask} />)}
      </DialogContent>
    </SwipeableDrawer>
  )
}