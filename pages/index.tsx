import React, { useEffect, useState } from 'react';

import { Input, TextArea } from '@components/form-elements.client';
import DatePicker from '@components/datepicker.client';
import { formatDate, roundToNearestQuarterAndFormat } from '@components/helpers/datetime.format';
import TagSelector from '@components/tag-selector.client';
import { Tag, updateTag } from "@redux/reducers/tags";
import { simple_hash } from '@components/helpers/encryption';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { useDispatch } from '@redux/hooks';
import { updateLog } from '@redux/reducers/log';
import { HttpRequestPromise } from '@components/http-request';

interface ErrorMessages {
  element: string
  error: string
}

export default function Home() {
  const [serverIp, setServerIp] = useState(undefined);
  const [uniqueId, setUniqueId] = useState(undefined);
  const [placeholder, setPlaceholder] = useState(roundToNearestQuarterAndFormat(new Date()));
  const [response, setResponse] = useState<ErrorMessages[]>([]);

  const log = useSelector((state: RootState) => state.logState);
  const tags = useSelector((state: RootState) => state.tagState.tags);
  const dispatch = useDispatch();

  const [serverIpForm, setServerIpForm] = useState('');

  useEffect(() => {
    const handleDataUpdate = (response: any) => {
      if (response.update == "tag") {
        dispatch(updateTag({ id: response.data.id, updatedTagData: response.data }));
      }
      console.log('Data updated:', response);
    };

    const cleanupListener = window.electron.onDataUpdate(handleDataUpdate);

    return () => {
      if (typeof cleanupListener === 'function') {
        //@ts-ignore
        cleanupListener();
      }
    };
  }, []);

  const updateData = (newData: any) => {
    window.electron.sendUpdate(newData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, placeholder?: string) => {
    const { name, value } = e.target;
    const _name = name.replaceAll(" ", "").toLocaleLowerCase();
    dispatch(updateLog({ log: { [_name]: placeholder ? placeholder : value } }));
  };

  const handleEnterPress = (value: string) => {
    dispatch(updateLog({ log: { notes: value + '\n' } }));
  }

  const handleDate = (date) => {
    dispatch(updateLog({ log: { date: new Date(date).toISOString() } }));
  }

  const handleTags = (newTags: Tag[] | ((tags: Tag[]) => Tag[])) => {
    let updatedTags = [];

    if (typeof newTags === 'function') {
      updatedTags = newTags(log.tags);
    } else if (Array.isArray(newTags)) {
      updatedTags = newTags;
    } else {
      console.error('Provided newTags are not valid:', newTags);
      return;
    }

    dispatch(updateLog({
      log: {
        tags: updatedTags,
      }
    }));
  };

  useEffect(() => {
    const obj2Map = new Map(log.tags.map(obj => [obj.id, obj]));
    const matchingObjects = tags.filter(obj1 => obj2Map.has(obj1.id));
    dispatch(updateLog({
      log: {
        tags: matchingObjects,
      }
    }))
  }, [tags]);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    HttpRequestPromise('/api/entry',
      {
        method: 'POST',
        body: JSON.stringify(log)
      }
    ).then(response => {
      dispatch(updateLog({
        log: {
          date: new Date(Date.now()).toISOString(),
          starttime: '',
          endtime: '',
          description: '',
          notes: '',
          tags: [],
        }
      }));
    }).catch(error => {
      if (error != null) {
        const errors = error.split(', ');
        const errorArray = [] as ErrorMessages[];
        errors.forEach(element => {
          const formElement = element.match(/"(.*?)"/)[1];
          const error = element.replace(/^[^\s]+\s+/, '');
          errorArray.push({
            element: formElement,
            error: error
          });
        });
        setResponse(errorArray);
      }
    });
  }

  useEffect(() => {
    const updatePlaceholder = () => {
      const newPlaceholder = roundToNearestQuarterAndFormat(new Date());
      setPlaceholder(newPlaceholder);
    };

    const intervalId = setInterval(updatePlaceholder, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  };

  const hanldeTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    const name = e.target.name;
    const _name = name.replaceAll(" ", "").toLocaleLowerCase();
    value = value.replace(/[^0-9:]/g, '');

    if (value.includes(':') && value.lastIndexOf(':') !== value.indexOf(':')) {
      value = value.substring(0, value.lastIndexOf(':'));
    }

    if (value.length > 2 && value[2] !== ':') {
      value = value.substring(0, 2) + ':' + value.substring(2);
    }

    if (value.length > 5) {
      value = value.substring(0, 5);
    }

    dispatch(updateLog({ log: { [_name]: value } }));
  };

  useEffect(() => {
    window.electron.getStoreValue('serverIp').then(value => {
      setServerIp(value);
    });
    window.electron.getStoreValue('uniqueId').then(value => {
      setUniqueId(value);
      console.log(value);
    });
  }, []);

  const handleServerIpStorage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.electron.setStoreValue('serverIp', serverIpForm).then(() => {
      setServerIp(serverIpForm);
    });
    const hash = simple_hash();
    window.electron.setStoreValue('uniqueId', hash).then(() => {
      setUniqueId(hash);
    });
  }

  const handleIpChange = (e: React.ChangeEvent<HTMLInputElement>, placeholder?: string) => {
    const { value } = e.target;
    setServerIpForm(value);
  };

  if (!serverIp) {
    return (
      <form onSubmit={handleServerIpStorage} className='flex justify-center flex-col h-96'>
        <Input value={serverIpForm} setValueOnChange={handleIpChange} title="Server Ip" placeholder="127.0.0.1:8081" />
        <div className="relative flex justify-center items-center mt-2">
          <button className="bg-lime-500 hover:bg-lime-600 text-white py-2 px-7 text-xs rounded-md" type="submit">
            Save
          </button>
        </div>
      </form>
    );
  } else {
    return (
      <form onKeyDown={handleKeyDown} onSubmit={handleSubmit}>
        <div className="relative mt-5">
          <DatePicker setDates={handleDate} title="Date" placeholder={formatDate(new Date(Date.now()))} startAndEndDate={false} />
        </div>

        <div className="flex justify-items-stretch space-x-2">
          <Input value={log.starttime} setValueOnDoubleClick={handleChange} setValueOnChange={hanldeTimeChange} title="Start Time" placeholder={placeholder}
            error={response.find(e => e.element == 'start_time')?.error} />
          <Input value={log.endtime} setValueOnDoubleClick={handleChange} setValueOnChange={hanldeTimeChange} title="End Time" placeholder={placeholder} error={response.find(e => e.element == 'end_time')?.error} />
        </div>

        <Input value={log.description} setValueOnChange={handleChange} title="Description" placeholder="Description" error={response.find(e => e.element == 'description')?.error} />
        <TextArea value={log.notes} setValueOnChange={handleChange} setValueOnEnter={handleEnterPress} title="Notes" placeholder="Notes" error={response.find(e => e.element == 'notes')?.error} />

        <div className="relative mt-5">
          <TagSelector
            selectedTags={log.tags}
            setselectedTags={handleTags}
            error={response.find(e => e.element == 'tags')?.error}
          />
        </div>

        {response.length != 0 && <div className={`mt-2 text-xs text-center ${response.length != 0 ? 'text-red-500' : 'text-gray-400'} `}>Entry was not inserted</div>}
        <div className="relative flex justify-center items-center mt-2">
          <button className="bg-lime-500 hover:bg-lime-600 text-white py-2 px-7 text-xs rounded-md" type="submit">
            Submit
          </button>
        </div>
      </form>
    );

  }
}